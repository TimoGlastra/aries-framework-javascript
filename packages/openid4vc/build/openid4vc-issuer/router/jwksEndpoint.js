"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureJwksEndpoint = configureJwksEndpoint;
const core_1 = require("@credo-ts/core");
const router_1 = require("../../shared/router");
function configureJwksEndpoint(router, config) {
    router.get(config.jwksEndpointPath, async (_request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(_request);
        try {
            const jwks = {
                keys: [(0, core_1.getJwkFromKey)(core_1.Key.fromFingerprint(issuer.accessTokenPublicKeyFingerprint)).toJson()],
            };
            return (0, router_1.sendJsonResponse)(response, next, jwks, 'application/jwk-set+json');
        }
        catch (e) {
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, e);
        }
    });
}
//# sourceMappingURL=jwksEndpoint.js.map