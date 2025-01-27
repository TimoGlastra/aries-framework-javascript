"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrIndyDidResolver = void 0;
const anoncreds_1 = require("@credo-ts/anoncreds");
const pool_1 = require("../pool");
const didIndyUtil_1 = require("./didIndyUtil");
class IndyVdrIndyDidResolver {
    constructor() {
        this.supportedMethods = ['indy'];
        this.allowsCaching = true;
        this.allowsLocalDidRecord = true;
    }
    async resolve(agentContext, did) {
        const didDocumentMetadata = {};
        try {
            const poolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const pool = poolService.getPoolForNamespace((0, anoncreds_1.parseIndyDid)(did).namespace);
            // Get DID Document from Get NYM response
            const didDocument = await (0, didIndyUtil_1.buildDidDocument)(agentContext, pool, did);
            return {
                didDocument,
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
}
exports.IndyVdrIndyDidResolver = IndyVdrIndyDidResolver;
//# sourceMappingURL=IndyVdrIndyDidResolver.js.map