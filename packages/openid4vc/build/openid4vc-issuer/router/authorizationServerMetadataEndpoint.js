"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureOAuthAuthorizationServerMetadataEndpoint = configureOAuthAuthorizationServerMetadataEndpoint;
const oauth2_1 = require("@animo-id/oauth2");
const router_1 = require("../../shared/router");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
/**
 * This is the credo authorization server metadata. It is only used for pre-authorized
 * code flow.
 */
function configureOAuthAuthorizationServerMetadataEndpoint(router) {
    router.get('/.well-known/oauth-authorization-server', async (_request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(_request);
        try {
            const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
            const issuerAuthorizationServer = (0, oauth2_1.getAuthorizationServerMetadataFromList)(issuerMetadata.authorizationServers, issuerMetadata.credentialIssuer.credential_issuer);
            return (0, router_1.sendJsonResponse)(response, next, issuerAuthorizationServer);
        }
        catch (e) {
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, e);
        }
    });
}
//# sourceMappingURL=authorizationServerMetadataEndpoint.js.map