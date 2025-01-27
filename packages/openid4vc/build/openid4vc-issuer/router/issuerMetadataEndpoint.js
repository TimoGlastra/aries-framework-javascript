"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureIssuerMetadataEndpoint = configureIssuerMetadataEndpoint;
const oauth2_1 = require("@animo-id/oauth2");
const router_1 = require("../../shared/router");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
function configureIssuerMetadataEndpoint(router) {
    router.get('/.well-known/openid-credential-issuer', async (_request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(_request);
        try {
            const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
            const vcIssuer = openId4VcIssuerService.getIssuer(agentContext);
            const issuerAuthorizationServer = (0, oauth2_1.getAuthorizationServerMetadataFromList)(issuerMetadata.authorizationServers, issuerMetadata.credentialIssuer.credential_issuer);
            const transformedMetadata = Object.assign(Object.assign({}, vcIssuer.getCredentialIssuerMetadataDraft11(issuerMetadata.credentialIssuer)), { 
                // TOOD: these values should be removed, as they need to be hosted in the oauth-authorization-server
                // metadata. For backwards compatiblity we will keep them in now.
                token_endpoint: issuerAuthorizationServer.token_endpoint, dpop_signing_alg_values_supported: issuerAuthorizationServer.dpop_signing_alg_values_supported });
            return (0, router_1.sendJsonResponse)(response, next, transformedMetadata);
        }
        catch (e) {
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, e);
        }
    });
}
//# sourceMappingURL=issuerMetadataEndpoint.js.map