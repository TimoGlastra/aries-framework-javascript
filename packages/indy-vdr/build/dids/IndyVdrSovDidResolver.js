"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrSovDidResolver = void 0;
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const error_1 = require("../error");
const IndyVdrPoolService_1 = require("../pool/IndyVdrPoolService");
const didSovUtil_1 = require("./didSovUtil");
class IndyVdrSovDidResolver {
    constructor() {
        this.supportedMethods = ['sov'];
        this.allowsCaching = true;
    }
    async resolve(agentContext, did, parsed) {
        const didDocumentMetadata = {};
        try {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(IndyVdrPoolService_1.IndyVdrPoolService);
            // FIXME: this actually fetches the did twice (if not cached), once for the pool and once for the nym
            // we do not store the diddocContent in the pool cache currently so we need to fetch it again
            // The logic is mostly to determine which pool to use for a did
            const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, parsed.id);
            const nym = await this.getPublicDid(pool, parsed.id);
            const endpoints = await this.getEndpointsForDid(agentContext, pool, parsed.id);
            const keyAgreementId = `${parsed.did}#key-agreement-1`;
            const builder = (0, didSovUtil_1.sovDidDocumentFromDid)(parsed.did, nym.verkey);
            if (endpoints) {
                (0, didSovUtil_1.addServicesFromEndpointsAttrib)(builder, parsed.did, endpoints, keyAgreementId);
            }
            return {
                didDocument: builder.build(),
                didDocumentMetadata,
                didResolutionMetadata: { contentType: 'application/did+ld+json' },
            };
        }
        catch (error) {
            return {
                didDocument: null,
                didDocumentMetadata,
                didResolutionMetadata: {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve did '${did}': ${error}`,
                },
            };
        }
    }
    async getPublicDid(pool, unqualifiedDid) {
        const request = new indy_vdr_shared_1.GetNymRequest({ dest: unqualifiedDid });
        const didResponse = await pool.submitRequest(request);
        if (!didResponse.result.data) {
            throw new error_1.IndyVdrNotFoundError(`DID ${unqualifiedDid} not found`);
        }
        return JSON.parse(didResponse.result.data);
    }
    async getEndpointsForDid(agentContext, pool, did) {
        var _a;
        try {
            agentContext.config.logger.debug(`Get endpoints for did '${did}' from ledger '${pool.indyNamespace}'`);
            const request = new indy_vdr_shared_1.GetAttribRequest({ targetDid: did, raw: 'endpoint' });
            agentContext.config.logger.debug(`Submitting get endpoint ATTRIB request for did '${did}' to ledger '${pool.indyNamespace}'`);
            const response = await pool.submitRequest(request);
            if (!response.result.data) {
                return null;
            }
            const endpoints = (_a = JSON.parse(response.result.data)) === null || _a === void 0 ? void 0 : _a.endpoint;
            agentContext.config.logger.debug(`Got endpoints '${JSON.stringify(endpoints)}' for did '${did}' from ledger '${pool.indyNamespace}'`, {
                response,
                endpoints,
            });
            return endpoints !== null && endpoints !== void 0 ? endpoints : null;
        }
        catch (error) {
            agentContext.config.logger.error(`Error retrieving endpoints for did '${did}' from ledger '${pool.indyNamespace}'`, {
                error,
            });
            throw new error_1.IndyVdrError(error);
        }
    }
}
exports.IndyVdrSovDidResolver = IndyVdrSovDidResolver;
//# sourceMappingURL=IndyVdrSovDidResolver.js.map