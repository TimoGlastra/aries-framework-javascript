"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAccessTokenEndpoint = configureAccessTokenEndpoint;
exports.handleTokenRequest = handleTokenRequest;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
const router_1 = require("../../shared/router");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const repository_1 = require("../repository");
function configureAccessTokenEndpoint(router, config) {
    router.post(config.accessTokenEndpointPath, handleTokenRequest(config));
}
function handleTokenRequest(config) {
    return async (request, response, next) => {
        var _a, _b, _c, _d;
        response.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
        const requestContext = (0, router_1.getRequestContext)(request);
        const { agentContext, issuer } = requestContext;
        const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
        const issuanceSessionRepository = agentContext.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
        const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
        const accessTokenSigningKey = core_1.Key.fromFingerprint(issuer.accessTokenPublicKeyFingerprint);
        const oauth2AuthorizationServer = openId4VcIssuerService.getOauth2AuthorizationServer(agentContext);
        const fullRequestUrl = (0, core_1.joinUriParts)(issuerMetadata.credentialIssuer.credential_issuer, [
            config.accessTokenEndpointPath,
        ]);
        const requestLike = {
            headers: new Headers(request.headers),
            method: request.method,
            url: fullRequestUrl,
        };
        const { accessTokenRequest, grant, dpopJwt, pkceCodeVerifier } = oauth2AuthorizationServer.parseAccessTokenRequest({
            accessTokenRequest: request.body,
            request: requestLike,
        });
        const issuanceSession = await issuanceSessionRepository.findSingleByQuery(agentContext, {
            preAuthorizedCode: grant.grantType === oauth2_1.preAuthorizedCodeGrantIdentifier ? grant.preAuthorizedCode : undefined,
            authorizationCode: grant.grantType === oauth2_1.authorizationCodeGrantIdentifier ? grant.code : undefined,
        });
        const allowedStates = grant.grantType === oauth2_1.preAuthorizedCodeGrantIdentifier
            ? [OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved]
            : [OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AuthorizationGranted];
        if (!issuanceSession || !allowedStates.includes(issuanceSession.state)) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidGrant,
                error_description: 'Invalid authorization code',
            });
        }
        if (Date.now() >
            (0, utils_1.addSecondsToDate)(issuanceSession.createdAt, config.statefullCredentialOfferExpirationInSeconds).getTime()) {
            issuanceSession.errorMessage = 'Credential offer has expired';
            await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error);
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                // What is the best error here?
                error: oauth2_1.Oauth2ErrorCodes.InvalidGrant,
                error_description: 'Session expired',
            });
        }
        let verificationResult;
        try {
            if (grant.grantType === oauth2_1.preAuthorizedCodeGrantIdentifier) {
                if (!issuanceSession.preAuthorizedCode) {
                    throw new oauth2_1.Oauth2ServerErrorResponseError({
                        error: oauth2_1.Oauth2ErrorCodes.InvalidGrant,
                        error_description: 'Invalid authorization code',
                    }, {
                        internalMessage: 'Found issuance session without preAuthorizedCode. This should not happen as the issuance session is fetched based on the pre authorized code',
                    });
                }
                verificationResult = await oauth2AuthorizationServer.verifyPreAuthorizedCodeAccessTokenRequest({
                    accessTokenRequest,
                    expectedPreAuthorizedCode: issuanceSession.preAuthorizedCode,
                    grant,
                    request: requestLike,
                    dpop: {
                        jwt: dpopJwt,
                        // This will only have effect when DPoP is not present.
                        // If it is present it will always be verified
                        required: config.dpopRequired,
                    },
                    expectedTxCode: issuanceSession.userPin,
                    preAuthorizedCodeExpiresAt: (0, utils_1.addSecondsToDate)(issuanceSession.createdAt, config.statefullCredentialOfferExpirationInSeconds),
                });
            }
            else if (grant.grantType === oauth2_1.authorizationCodeGrantIdentifier) {
                if (!((_a = issuanceSession.authorization) === null || _a === void 0 ? void 0 : _a.code) || !((_b = issuanceSession.authorization) === null || _b === void 0 ? void 0 : _b.codeExpiresAt)) {
                    throw new oauth2_1.Oauth2ServerErrorResponseError({
                        error: oauth2_1.Oauth2ErrorCodes.InvalidGrant,
                        error_description: 'Invalid authorization code',
                    }, {
                        internalMessage: 'Found issuance session without authorization.code or authorization.codeExpiresAt. This should not happen as the issuance session is fetched based on the authorization code',
                    });
                }
                verificationResult = await oauth2AuthorizationServer.verifyAuthorizationCodeAccessTokenRequest({
                    accessTokenRequest,
                    expectedCode: issuanceSession.authorization.code,
                    codeExpiresAt: issuanceSession.authorization.codeExpiresAt,
                    grant,
                    request: requestLike,
                    dpop: {
                        jwt: dpopJwt,
                        // This will only have effect when DPoP is not present.
                        // If it is present it will always be verified
                        required: config.dpopRequired,
                    },
                    pkce: issuanceSession.pkce
                        ? {
                            codeChallenge: issuanceSession.pkce.codeChallenge,
                            codeChallengeMethod: issuanceSession.pkce.codeChallengeMethod,
                            codeVerifier: pkceCodeVerifier,
                        }
                        : undefined,
                });
            }
            else {
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.UnsupportedGrantType,
                    error_description: 'Unsupported grant type',
                });
            }
            await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenRequested);
            const { cNonce, cNonceExpiresInSeconds } = await openId4VcIssuerService.createNonce(agentContext, issuer);
            // for authorization code flow we take the authorization scopes. For pre-auth we don't use scopes (we just
            // use the offered credential configuration ids so a scope is not required)
            const scopes = grant.grantType === oauth2_1.authorizationCodeGrantIdentifier ? (_c = issuanceSession.authorization) === null || _c === void 0 ? void 0 : _c.scopes : undefined;
            const subject = `credo:${core_1.utils.uuid()}`;
            const signerJwk = (0, core_1.getJwkFromKey)(accessTokenSigningKey);
            const accessTokenResponse = await oauth2AuthorizationServer.createAccessTokenResponse({
                audience: issuerMetadata.credentialIssuer.credential_issuer,
                authorizationServer: issuerMetadata.credentialIssuer.credential_issuer,
                expiresInSeconds: config.accessTokenExpiresInSeconds,
                signer: {
                    method: 'jwk',
                    alg: signerJwk.supportedSignatureAlgorithms[0],
                    publicJwk: signerJwk.toJson(),
                },
                dpopJwk: verificationResult.dpopJwk,
                scope: scopes === null || scopes === void 0 ? void 0 : scopes.join(' '),
                clientId: issuanceSession.clientId,
                additionalAccessTokenPayload: {
                    'pre-authorized_code': grant.grantType === oauth2_1.preAuthorizedCodeGrantIdentifier ? grant.preAuthorizedCode : undefined,
                    issuer_state: (_d = issuanceSession.authorization) === null || _d === void 0 ? void 0 : _d.issuerState,
                },
                // We generate a random subject for each access token and bind the issuance session to this.
                subject,
                // NOTE: these have been removed in newer drafts. Keeping them in for now
                cNonce,
                cNonceExpiresIn: cNonceExpiresInSeconds,
            });
            issuanceSession.authorization = Object.assign(Object.assign({}, issuanceSession.authorization), { subject });
            await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenCreated);
            return (0, router_1.sendJsonResponse)(response, next, accessTokenResponse);
        }
        catch (error) {
            if (error instanceof oauth2_1.Oauth2ServerErrorResponseError) {
                return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, error);
            }
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, error);
        }
    };
}
//# sourceMappingURL=accessTokenEndpoint.js.map