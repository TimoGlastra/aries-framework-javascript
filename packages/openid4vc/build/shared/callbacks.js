"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOid4vciJwtVerifyCallback = getOid4vciJwtVerifyCallback;
exports.getOid4vciJwtSignCallback = getOid4vciJwtSignCallback;
exports.getOid4vciCallbacks = getOid4vciCallbacks;
exports.dynamicOid4vciClientAuthentication = dynamicOid4vciClientAuthentication;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
const utils_1 = require("./utils");
function getOid4vciJwtVerifyCallback(agentContext) {
    const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
    return async (signer, { compact }) => {
        const { isValid } = await jwsService.verifyJws(agentContext, {
            jws: compact,
            // Only handles kid as did resolution. JWK is handled by jws service
            jwkResolver: async () => {
                if (signer.method === 'jwk') {
                    return (0, core_1.getJwkFromJson)(signer.publicJwk);
                }
                else if (signer.method === 'did') {
                    const key = await (0, utils_1.getKeyFromDid)(agentContext, signer.didUrl);
                    return (0, core_1.getJwkFromKey)(key);
                }
                throw new core_1.CredoError(`Unexpected call to jwk resolver for signer method ${signer.method}`);
            },
        });
        return isValid;
    };
}
function getOid4vciJwtSignCallback(agentContext) {
    const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
    return async (signer, { payload, header }) => {
        if (signer.method === 'custom' || signer.method === 'x5c') {
            throw new core_1.CredoError(`Jwt signer method 'custom' and 'x5c' are not supported for jwt signer.`);
        }
        const key = signer.method === 'did' ? await (0, utils_1.getKeyFromDid)(agentContext, signer.didUrl) : (0, core_1.getJwkFromJson)(signer.publicJwk).key;
        const jwk = (0, core_1.getJwkFromKey)(key);
        if (!jwk.supportsSignatureAlgorithm(signer.alg)) {
            throw new core_1.CredoError(`key type '${jwk.keyType}', does not support the JWS signature alg '${signer.alg}'`);
        }
        const jwt = await jwsService.createJwsCompact(agentContext, {
            protectedHeaderOptions: Object.assign(Object.assign({}, header), { jwk: header.jwk ? (0, core_1.getJwkFromJson)(header.jwk) : undefined }),
            payload: core_1.JsonEncoder.toBuffer(payload),
            key,
        });
        return jwt;
    };
}
function getOid4vciCallbacks(agentContext) {
    return {
        hash: (data, alg) => core_1.Hasher.hash(data, alg.toLowerCase()),
        generateRandom: (length) => agentContext.wallet.getRandomValues(length),
        signJwt: getOid4vciJwtSignCallback(agentContext),
        clientAuthentication: (0, oauth2_1.clientAuthenticationNone)(),
        verifyJwt: getOid4vciJwtVerifyCallback(agentContext),
        fetch: agentContext.config.agentDependencies.fetch,
    };
}
/**
 * Allows us to authenticate when making requests to an external
 * authorizatin server
 */
function dynamicOid4vciClientAuthentication(agentContext, issuerRecord) {
    return (callbackOptions) => {
        var _a;
        const authorizationServer = (_a = issuerRecord.authorizationServerConfigs) === null || _a === void 0 ? void 0 : _a.find((a) => a.issuer === callbackOptions.authorizationServerMetata.issuer);
        if (!authorizationServer) {
            // No client authentication if authorization server is not configured
            agentContext.config.logger.debug(`Unknown authorization server '${callbackOptions.authorizationServerMetata.issuer}' for issuer '${issuerRecord.issuerId}' for request to '${callbackOptions.url}'`);
            return;
        }
        if (!authorizationServer.clientAuthentication) {
            throw new core_1.CredoError(`Unable to authenticate to authorization server '${authorizationServer.issuer}' for issuer '${issuerRecord.issuerId}' for request to '${callbackOptions.url}'. Make sure to configure a 'clientId' and 'clientSecret' for the authorization server on the issuer record.`);
        }
        return (0, oauth2_1.clientAuthenticationDynamic)({
            clientId: authorizationServer.clientAuthentication.clientId,
            clientSecret: authorizationServer.clientAuthentication.clientSecret,
        })(callbackOptions);
    };
}
//# sourceMappingURL=callbacks.js.map