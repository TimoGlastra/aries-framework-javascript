"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrPoolService = void 0;
const anoncreds_1 = require("@credo-ts/anoncreds");
const core_1 = require("@credo-ts/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const IndyVdrModuleConfig_1 = require("../IndyVdrModuleConfig");
const error_1 = require("../error");
const did_1 = require("../utils/did");
const promises_1 = require("../utils/promises");
const IndyVdrPool_1 = require("./IndyVdrPool");
let IndyVdrPoolService = class IndyVdrPoolService {
    constructor(logger, indyVdrModuleConfig) {
        this.pools = [];
        this.logger = logger;
        this.indyVdrModuleConfig = indyVdrModuleConfig;
        this.pools = this.indyVdrModuleConfig.networks.map((poolConfig) => new IndyVdrPool_1.IndyVdrPool(poolConfig));
    }
    /**
     * Get the most appropriate pool for the given did.
     * If the did is a qualified indy did, the pool will be determined based on the namespace.
     * If it is a legacy unqualified indy did, the pool will be determined based on the algorithm as described in this document:
     * https://docs.google.com/document/d/109C_eMsuZnTnYe2OAd02jAts1vC4axwEKIq7_4dnNVA/edit
     *
     * This method will optionally return a nym response when the did has been resolved to determine the ledger
     * either now or in the past. The nymResponse can be used to prevent multiple ledger quries fetching the same
     * did
     */
    async getPoolForDid(agentContext, did) {
        // Check if the did starts with did:indy
        const match = did.match(anoncreds_1.didIndyRegex);
        if (match) {
            const [, namespace] = match;
            const pool = this.getPoolForNamespace(namespace);
            if (pool)
                return { pool };
            throw new error_1.IndyVdrError(`Pool for indy namespace '${namespace}' not found`);
        }
        else {
            return await this.getPoolForLegacyDid(agentContext, did);
        }
    }
    async getPoolForLegacyDid(agentContext, did) {
        var _a;
        const pools = this.pools;
        if (pools.length === 0) {
            throw new error_1.IndyVdrNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndyVdrModuleConfigOptions.networks');
        }
        const cache = agentContext.dependencyManager.resolve(core_1.CacheModuleConfig).cache;
        const cacheKey = `IndyVdrPoolService:${did}`;
        const cachedNymResponse = await cache.get(agentContext, cacheKey);
        const pool = this.pools.find((pool) => pool.indyNamespace === (cachedNymResponse === null || cachedNymResponse === void 0 ? void 0 : cachedNymResponse.indyNamespace));
        // If we have the nym response with associated pool in the cache, we'll use that
        if (cachedNymResponse && pool) {
            this.logger.trace(`Found ledger id '${pool.indyNamespace}' for did '${did}' in cache`);
            return { pool, nymResponse: cachedNymResponse.nymResponse };
        }
        const { successful, rejected } = await this.getSettledDidResponsesFromPools(did, pools);
        if (successful.length === 0) {
            const allNotFound = rejected.every((e) => e.reason instanceof error_1.IndyVdrNotFoundError);
            const rejectedOtherThanNotFound = rejected.filter((e) => !(e.reason instanceof error_1.IndyVdrNotFoundError));
            // All ledgers returned response that the did was not found
            if (allNotFound) {
                throw new error_1.IndyVdrNotFoundError(`Did '${did}' not found on any of the ledgers (total ${this.pools.length}).`);
            }
            // one or more of the ledgers returned an unknown error
            throw new error_1.IndyVdrError(`Unknown error retrieving did '${did}' from '${rejectedOtherThanNotFound.length}' of '${pools.length}' ledgers. ${rejectedOtherThanNotFound[0].reason}`, { cause: rejectedOtherThanNotFound[0].reason });
        }
        // If there are self certified DIDs we always prefer it over non self certified DIDs
        // We take the first self certifying DID as we take the order in the
        // IndyVdrModuleConfigOptions.networks config as the order of preference of ledgers
        let value = (_a = successful.find((response) => (0, did_1.isSelfCertifiedDid)(response.value.did.nymResponse.did, response.value.did.nymResponse.verkey))) === null || _a === void 0 ? void 0 : _a.value;
        if (!value) {
            // Split between production and nonProduction ledgers. If there is at least one
            // successful response from a production ledger, only keep production ledgers
            // otherwise we only keep the non production ledgers.
            const production = successful.filter((s) => s.value.pool.config.isProduction);
            const nonProduction = successful.filter((s) => !s.value.pool.config.isProduction);
            const productionOrNonProduction = production.length >= 1 ? production : nonProduction;
            // We take the first value as we take the order in the IndyVdrModuleConfigOptions.networks
            // config as the order of preference of ledgers
            value = productionOrNonProduction[0].value;
        }
        await cache.set(agentContext, cacheKey, {
            nymResponse: {
                did: value.did.nymResponse.did,
                verkey: value.did.nymResponse.verkey,
            },
            indyNamespace: value.did.indyNamespace,
        });
        return { pool: value.pool, nymResponse: value.did.nymResponse };
    }
    async getSettledDidResponsesFromPools(did, pools) {
        this.logger.trace(`Retrieving did '${did}' from ${pools.length} ledgers`);
        const didResponses = await (0, promises_1.allSettled)(pools.map((pool) => this.getDidFromPool(did, pool)));
        const successful = (0, promises_1.onlyFulfilled)(didResponses);
        this.logger.trace(`Retrieved ${successful.length} responses from ledgers for did '${did}'`);
        const rejected = (0, promises_1.onlyRejected)(didResponses);
        return {
            rejected,
            successful,
        };
    }
    /**
     * Refresh the pool connections asynchronously
     */
    refreshPoolConnections() {
        return Promise.allSettled(this.pools.map((pool) => pool.refreshConnection()));
    }
    /**
     * Get all pool transactions
     */
    getAllPoolTransactions() {
        return Promise.allSettled(this.pools.map(async (pool) => {
            return { config: pool.config, transactions: await pool.transactions };
        }));
    }
    /**
     * Get the most appropriate pool for the given indyNamespace
     */
    getPoolForNamespace(indyNamespace) {
        if (this.pools.length === 0) {
            throw new error_1.IndyVdrNotConfiguredError('No indy ledgers configured. Provide at least one pool configuration in IndyVdrModuleConfigOptions.networks');
        }
        const pool = this.pools.find((pool) => pool.indyNamespace === indyNamespace);
        if (!pool) {
            throw new error_1.IndyVdrError(`No ledgers found for indy namespace '${indyNamespace}'.`);
        }
        return pool;
    }
    async getDidFromPool(did, pool) {
        try {
            this.logger.trace(`Get public did '${did}' from ledger '${pool.indyNamespace}'`);
            const request = new indy_vdr_shared_1.GetNymRequest({ dest: did });
            this.logger.trace(`Submitting get did request for did '${did}' to ledger '${pool.indyNamespace}'`);
            const response = await pool.submitRequest(request);
            if (!response.result.data) {
                throw new error_1.IndyVdrNotFoundError(`Did ${did} not found on indy pool with namespace ${pool.indyNamespace}`);
            }
            const result = JSON.parse(response.result.data);
            this.logger.trace(`Retrieved did '${did}' from ledger '${pool.indyNamespace}'`, result);
            return {
                did: { nymResponse: { did: result.dest, verkey: result.verkey }, indyNamespace: pool.indyNamespace },
                pool,
                response,
            };
        }
        catch (error) {
            this.logger.trace(`Error retrieving did '${did}' from ledger '${pool.indyNamespace}'`, {
                error,
                did,
            });
            throw error;
        }
    }
};
exports.IndyVdrPoolService = IndyVdrPoolService;
exports.IndyVdrPoolService = IndyVdrPoolService = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [Object, IndyVdrModuleConfig_1.IndyVdrModuleConfig])
], IndyVdrPoolService);
//# sourceMappingURL=IndyVdrPoolService.js.map