"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureNonceEndpoint = configureNonceEndpoint;
const router_1 = require("../../shared/router");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
function configureNonceEndpoint(router, config) {
    router.post(config.nonceEndpointPath, async (request, response, next) => {
        response.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
        const requestContext = (0, router_1.getRequestContext)(request);
        const { agentContext, issuer } = requestContext;
        try {
            const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const vcIssuer = openId4VcIssuerService.getIssuer(agentContext);
            const { cNonce, cNonceExpiresInSeconds } = await openId4VcIssuerService.createNonce(agentContext, issuer);
            const nonceResponse = vcIssuer.createNonceResponse({
                cNonce,
                cNonceExpiresIn: cNonceExpiresInSeconds,
            });
            return (0, router_1.sendJsonResponse)(response, next, nonceResponse);
        }
        catch (error) {
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, error);
        }
    });
}
//# sourceMappingURL=nonceEndpoint.js.map