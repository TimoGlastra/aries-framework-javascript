"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCredentialEndpoint = configureCredentialEndpoint;
const router_1 = require("../../shared/router");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const credentialRequest_1 = require("../util/credentialRequest");
const verifyResourceRequest_1 = require("./verifyResourceRequest");
function configureCredentialEndpoint(router, config) {
    router.post(config.endpointPath, async (request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(request);
        const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
        let preAuthorizedCode;
        // Verify the access token (should at some point be moved to a middleware function or something)
        try {
            preAuthorizedCode = (await (0, verifyResourceRequest_1.verifyResourceRequest)(agentContext, issuer, request)).preAuthorizedCode;
        }
        catch (error) {
            return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 401, 'unauthorized', error);
        }
        try {
            const credentialRequest = request.body;
            const issuanceSession = await openId4VcIssuerService.findIssuanceSessionForCredentialRequest(agentContext, {
                issuerId: issuer.issuerId,
                credentialRequest,
            });
            if ((issuanceSession === null || issuanceSession === void 0 ? void 0 : issuanceSession.preAuthorizedCode) !== preAuthorizedCode) {
                agentContext.config.logger.warn(`Credential request used access token with for credential offer with different pre-authorized code than was used for the issuance session ${issuanceSession === null || issuanceSession === void 0 ? void 0 : issuanceSession.id}`);
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 401, 'unauthorized', 'Access token is not valid for this credential request');
            }
            if (!issuanceSession) {
                const cNonce = (0, credentialRequest_1.getCNonceFromCredentialRequest)(credentialRequest);
                agentContext.config.logger.warn(`No issuance session found for incoming credential request with cNonce ${cNonce} and issuer ${issuer.issuerId}`);
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 404, 'invalid_request', null);
            }
            const { credentialResponse } = await openId4VcIssuerService.createCredentialResponse(agentContext, {
                issuanceSession,
                credentialRequest,
            });
            response.json(credentialResponse);
        }
        catch (error) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 500, 'invalid_request', error);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
}
//# sourceMappingURL=credentialEndpoint.js.map