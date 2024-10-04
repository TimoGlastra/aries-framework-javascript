"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAccessTokenEndpoint = configureAccessTokenEndpoint;
exports.handleTokenRequest = handleTokenRequest;
exports.verifyTokenRequest = verifyTokenRequest;
const core_1 = require("@credo-ts/core");
const oid4vc_common_1 = require("@sphereon/oid4vc-common");
const oid4vci_common_1 = require("@sphereon/oid4vci-common");
const oid4vci_issuer_1 = require("@sphereon/oid4vci-issuer");
const router_1 = require("../../shared/router");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuerModuleConfig_1 = require("../OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const OpenId4VcCNonceStateManager_1 = require("../repository/OpenId4VcCNonceStateManager");
const OpenId4VcCredentialOfferSessionStateManager_1 = require("../repository/OpenId4VcCredentialOfferSessionStateManager");
function configureAccessTokenEndpoint(router, config) {
    router.post(config.endpointPath, verifyTokenRequest({ preAuthorizedCodeExpirationInSeconds: config.preAuthorizedCodeExpirationInSeconds }), handleTokenRequest(config));
}
function getJwtSignerCallback(agentContext, signerPublicKey, config) {
    return async (jwt, _kid) => {
        var _a;
        if (_kid) {
            throw new core_1.CredoError('Kid should not be supplied externally.');
        }
        if (jwt.header.kid || jwt.header.jwk) {
            throw new core_1.CredoError('kid or jwk should not be present in access token header before signing');
        }
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const alg = (_a = (0, core_1.getJwkClassFromKeyType)(signerPublicKey.keyType)) === null || _a === void 0 ? void 0 : _a.supportedSignatureAlgorithms[0];
        if (!alg) {
            throw new core_1.CredoError(`No supported signature algorithms for key type: ${signerPublicKey.keyType}`);
        }
        // FIXME: the iat and exp implementation in OID4VCI is incorrect so we override the values here
        // https://github.com/Sphereon-Opensource/OID4VCI/pull/99
        // https://github.com/Sphereon-Opensource/OID4VCI/pull/101
        const iat = Math.floor(new Date().getTime() / 1000);
        jwt.payload.iat = iat;
        jwt.payload.exp = iat + config.tokenExpiresInSeconds;
        const jwk = (0, core_1.getJwkFromKey)(signerPublicKey);
        const signedJwt = await jwsService.createJwsCompact(agentContext, {
            protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { jwk, alg }),
            payload: core_1.JwtPayload.fromJson(jwt.payload),
            key: signerPublicKey,
        });
        return signedJwt;
    };
}
function handleTokenRequest(config) {
    const { tokenExpiresInSeconds, cNonceExpiresInSeconds } = config;
    return async (request, response, next) => {
        response.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
        const requestContext = (0, router_1.getRequestContext)(request);
        const { agentContext, issuer } = requestContext;
        const body = request.body;
        if (body.grant_type !== oid4vci_common_1.GrantTypes.PRE_AUTHORIZED_CODE) {
            return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, oid4vci_common_1.TokenErrorResponse.invalid_request, oid4vci_common_1.PRE_AUTHORIZED_CODE_REQUIRED_ERROR);
        }
        const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
        const issuerMetadata = openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
        const accessTokenSigningKey = core_1.Key.fromFingerprint(issuer.accessTokenPublicKeyFingerprint);
        let dpopJwk;
        if (request.headers.dpop) {
            try {
                const issuerConfig = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
                const fullUrl = (0, core_1.joinUriParts)(issuerConfig.baseUrl, [requestContext.issuer.issuerId, request.url]);
                dpopJwk = await (0, oid4vc_common_1.verifyDPoP)({ method: request.method, headers: request.headers, fullUrl }, {
                    jwtVerifyCallback: (0, utils_1.getVerifyJwtCallback)(agentContext),
                    expectAccessToken: false,
                    maxIatAgeInSeconds: undefined,
                    acceptedAlgorithms: issuerMetadata.dpopSigningAlgValuesSupported,
                });
            }
            catch (error) {
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, oid4vci_common_1.TokenErrorResponse.invalid_dpop_proof, error instanceof Error ? error.message : 'Unknown error');
            }
        }
        try {
            const accessTokenResponse = await (0, oid4vci_issuer_1.createAccessTokenResponse)(request.body, {
                credentialOfferSessions: new OpenId4VcCredentialOfferSessionStateManager_1.OpenId4VcCredentialOfferSessionStateManager(agentContext, issuer.issuerId),
                tokenExpiresIn: tokenExpiresInSeconds,
                accessTokenIssuer: issuerMetadata.issuerUrl,
                cNonce: await agentContext.wallet.generateNonce(),
                cNonceExpiresIn: cNonceExpiresInSeconds,
                cNonces: new OpenId4VcCNonceStateManager_1.OpenId4VcCNonceStateManager(agentContext, issuer.issuerId),
                accessTokenSignerCallback: getJwtSignerCallback(agentContext, accessTokenSigningKey, config),
                dPoPJwk: dpopJwk,
            });
            response.status(200).json(accessTokenResponse);
        }
        catch (error) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, oid4vci_common_1.TokenErrorResponse.invalid_request, error);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    };
}
function verifyTokenRequest(options) {
    return async (request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(request);
        try {
            const credentialOfferSessions = new OpenId4VcCredentialOfferSessionStateManager_1.OpenId4VcCredentialOfferSessionStateManager(agentContext, issuer.issuerId);
            const credentialOfferSession = await credentialOfferSessions.getAsserted(request.body[oid4vci_common_1.PRE_AUTH_CODE_LITERAL]);
            if (![oid4vci_common_1.IssueStatus.OFFER_CREATED, oid4vci_common_1.IssueStatus.OFFER_URI_RETRIEVED].includes(credentialOfferSession.status)) {
                throw new oid4vci_common_1.TokenError(400, oid4vci_common_1.TokenErrorResponse.invalid_request, 'Access token has already been retrieved');
            }
            const { preAuthSession } = await (0, oid4vci_issuer_1.assertValidAccessTokenRequest)(request.body, {
                // It should actually be in seconds. but the oid4vci library has some bugs related
                // to seconds vs milliseconds. We pass it as ms for now, but once the fix is released
                // we should pass it as seconds. We have an extra check below, so that we won't have
                // an security issue once the fix is released.
                // FIXME: https://github.com/Sphereon-Opensource/OID4VCI/pull/104
                expirationDuration: options.preAuthorizedCodeExpirationInSeconds * 1000,
                credentialOfferSessions,
            });
            // TODO: remove once above PR is merged and released
            const expiresAt = preAuthSession.createdAt + options.preAuthorizedCodeExpirationInSeconds * 1000;
            if (Date.now() > expiresAt) {
                throw new oid4vci_common_1.TokenError(400, oid4vci_common_1.TokenErrorResponse.invalid_grant, 'Pre-authorized code has expired');
            }
        }
        catch (error) {
            if (error instanceof oid4vci_common_1.TokenError) {
                (0, router_1.sendErrorResponse)(response, agentContext.config.logger, error.statusCode, error.responseError, error.getDescription());
            }
            else {
                (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, oid4vci_common_1.TokenErrorResponse.invalid_request, error);
            }
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    };
}
//# sourceMappingURL=accessTokenEndpoint.js.map