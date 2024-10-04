"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResourceRequest = verifyResourceRequest;
const core_1 = require("@credo-ts/core");
const oid4vc_common_1 = require("@sphereon/oid4vc-common");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuerModuleConfig_1 = require("../OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
async function verifyResourceRequest(agentContext, issuer, request) {
    const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
        throw new core_1.CredoError('No access token provided in the authorization header');
    }
    if (!authorizationHeader.startsWith('Bearer ') && !authorizationHeader.startsWith('DPoP ')) {
        throw new core_1.CredoError(`Invalid access token scheme. Expected Bearer or DPoP.`);
    }
    const issuerMetadata = openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
    const accessToken = core_1.Jwt.fromSerializedJwt(authorizationHeader.replace('Bearer ', '').replace('DPoP ', ''));
    const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
    const { isValid, signerKeys } = await jwsService.verifyJws(agentContext, {
        jws: accessToken.serializedJwt,
        jwkResolver: () => {
            throw new Error('No JWK resolver available for access token verification');
        },
    });
    const issuerConfig = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
    const fullUrl = (0, core_1.joinUriParts)(issuerConfig.baseUrl, [issuer.issuerId, request.url]);
    await (0, oid4vc_common_1.verifyResourceDPoP)({ method: request.method, headers: request.headers, fullUrl }, {
        jwtVerifyCallback: (0, utils_1.getVerifyJwtCallback)(agentContext),
        acceptedAlgorithms: issuerMetadata.dpopSigningAlgValuesSupported,
    });
    if (!isValid) {
        throw new core_1.CredoError('Signature on access token is invalid');
    }
    if (!signerKeys.map((key) => key.fingerprint).includes(issuer.accessTokenPublicKeyFingerprint)) {
        throw new core_1.CredoError('Access token was not signed by the expected issuer');
    }
    // Finally validate the JWT payload (expiry etc..)
    accessToken.payload.validate();
    if (accessToken.payload.iss !== issuerMetadata.issuerUrl) {
        throw new core_1.CredoError('Access token was not issued by the expected issuer');
    }
    if (typeof accessToken.payload.additionalClaims.preAuthorizedCode !== 'string') {
        throw new core_1.CredoError('No preAuthorizedCode present in access token');
    }
    return {
        preAuthorizedCode: accessToken.payload.additionalClaims.preAuthorizedCode,
    };
}
//# sourceMappingURL=verifyResourceRequest.js.map