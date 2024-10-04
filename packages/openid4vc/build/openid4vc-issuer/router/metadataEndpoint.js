"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureIssuerMetadataEndpoint = configureIssuerMetadataEndpoint;
const router_1 = require("../../shared/router");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
function configureIssuerMetadataEndpoint(router) {
    router.get('/.well-known/openid-credential-issuer', (_request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(_request);
        try {
            const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const issuerMetadata = openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
            const transformedMetadata = {
                credential_issuer: issuerMetadata.issuerUrl,
                token_endpoint: issuerMetadata.tokenEndpoint,
                credential_endpoint: issuerMetadata.credentialEndpoint,
                authorization_server: issuerMetadata.authorizationServer,
                authorization_servers: issuerMetadata.authorizationServer ? [issuerMetadata.authorizationServer] : undefined,
                credentials_supported: issuerMetadata.credentialsSupported,
                credential_configurations_supported: issuerMetadata.credentialConfigurationsSupported,
                display: issuerMetadata.issuerDisplay,
                dpop_signing_alg_values_supported: issuerMetadata.dpopSigningAlgValuesSupported,
            };
            response.status(200).json(transformedMetadata);
        }
        catch (e) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 500, 'invalid_request', e);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
}
//# sourceMappingURL=metadataEndpoint.js.map