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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSessionCoordinator = void 0;
const core_1 = require("@credo-ts/core");
const async_mutex_1 = require("async-mutex");
const TenantsModuleConfig_1 = require("../TenantsModuleConfig");
const TenantSessionMutex_1 = require("./TenantSessionMutex");
/**
 * Coordinates all agent context instance for tenant sessions.
 *
 * This class keeps a mapping of tenant ids (context correlation ids) to agent context sessions mapping. Each mapping contains the agent context,
 * the current session count and a mutex for making operations against the session mapping (opening / closing an agent context). The mutex ensures
 * we're not susceptible to race conditions where multiple calls to open/close an agent context are made at the same time. Even though JavaScript is
 * single threaded, promises can introduce race conditions as one process can stop and another process can be picked up.
 *
 * NOTE: the implementation doesn't yet cache agent context objects after they aren't being used for any sessions anymore. This means if a wallet is being used
 * often in a short time it will be opened/closed very often. This is an improvement to be made in the near future.
 */
let TenantSessionCoordinator = class TenantSessionCoordinator {
    constructor(rootAgentContext, logger, tenantsModuleConfig) {
        this.tenantAgentContextMapping = {};
        this.rootAgentContext = rootAgentContext;
        this.logger = logger;
        this.tenantsModuleConfig = tenantsModuleConfig;
        this.sessionMutex = new TenantSessionMutex_1.TenantSessionMutex(this.logger, this.tenantsModuleConfig.sessionLimit, 
        // TODO: we should probably allow a higher session acquire timeout if the storage is being updated?
        this.tenantsModuleConfig.sessionAcquireTimeout);
    }
    getSessionCountForTenant(tenantId) {
        var _a, _b;
        return (_b = (_a = this.tenantAgentContextMapping[tenantId]) === null || _a === void 0 ? void 0 : _a.sessionCount) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Get agent context to use for a session. If an agent context for this tenant does not exist yet
     * it will create it and store it for later use. If the agent context does already exist it will
     * be returned.
     *
     * @parm tenantRecord The tenant record for which to get the agent context
     */
    async getContextForSession(tenantRecord, { runInMutex, } = {}) {
        this.logger.debug(`Getting context for session with tenant '${tenantRecord.id}'`);
        // Wait for a session to be available
        await this.sessionMutex.acquireSession();
        try {
            return await this.mutexForTenant(tenantRecord.id).runExclusive(async () => {
                this.logger.debug(`Acquired lock for tenant '${tenantRecord.id}' to get context`);
                const tenantSessions = this.getTenantSessionsMapping(tenantRecord.id);
                // If we don't have an agent context already, create one and initialize it
                if (!tenantSessions.agentContext) {
                    this.logger.debug(`No agent context has been initialized for tenant '${tenantRecord.id}', creating one`);
                    tenantSessions.agentContext = await this.createAgentContext(tenantRecord);
                }
                // If we already have a context with sessions in place return the context and increment
                // the session count.
                tenantSessions.sessionCount++;
                this.logger.debug(`Increased agent context session count for tenant '${tenantRecord.id}' to ${tenantSessions.sessionCount}`);
                if (runInMutex) {
                    try {
                        await runInMutex(tenantSessions.agentContext);
                    }
                    catch (error) {
                        // If the runInMutex failed we should release the session again
                        tenantSessions.sessionCount--;
                        this.logger.debug(`Decreased agent context session count for tenant '${tenantSessions.agentContext.contextCorrelationId}' to ${tenantSessions.sessionCount} due to failure in mutex script`, error);
                        if (tenantSessions.sessionCount <= 0 && tenantSessions.agentContext) {
                            await this.closeAgentContext(tenantSessions.agentContext);
                            delete this.tenantAgentContextMapping[tenantSessions.agentContext.contextCorrelationId];
                        }
                        throw error;
                    }
                }
                return tenantSessions.agentContext;
            });
        }
        catch (error) {
            this.logger.debug(`Releasing session because an error occurred while getting the context for tenant ${tenantRecord.id}`, {
                errorMessage: error.message,
            });
            // If there was an error acquiring the session, we MUST release it, otherwise this will lead to deadlocks over time.
            this.sessionMutex.releaseSession();
            // Re-throw error
            throw error;
        }
    }
    /**
     * End a session for the provided agent context. It will decrease the session count for the agent context.
     * If the number of sessions is zero after the context for this session has been ended, the agent context will be closed.
     */
    async endAgentContextSession(agentContext) {
        this.logger.debug(`Ending session for agent context with contextCorrelationId ${agentContext.contextCorrelationId}'`);
        const hasTenantSessionMapping = this.hasTenantSessionMapping(agentContext.contextCorrelationId);
        // Custom handling for the root agent context. We don't keep track of the total number of sessions for the root
        // agent context, and we always keep the dependency manager intact.
        if (!hasTenantSessionMapping && agentContext.contextCorrelationId === this.rootAgentContext.contextCorrelationId) {
            this.logger.debug('Ending session for root agent context. Not disposing dependency manager');
            return;
        }
        // This should not happen
        if (!hasTenantSessionMapping) {
            this.logger.error(`Unknown agent context with contextCorrelationId '${agentContext.contextCorrelationId}'.  Cannot end session`);
            throw new core_1.CredoError(`Unknown agent context with contextCorrelationId '${agentContext.contextCorrelationId}'. Cannot end session`);
        }
        await this.mutexForTenant(agentContext.contextCorrelationId).runExclusive(async () => {
            this.logger.debug(`Acquired lock for tenant '${agentContext.contextCorrelationId}' to end session context`);
            const tenantSessions = this.getTenantSessionsMapping(agentContext.contextCorrelationId);
            // TODO: check if session count is already 0
            tenantSessions.sessionCount--;
            this.logger.debug(`Decreased agent context session count for tenant '${agentContext.contextCorrelationId}' to ${tenantSessions.sessionCount}`);
            if (tenantSessions.sessionCount <= 0 && tenantSessions.agentContext) {
                await this.closeAgentContext(tenantSessions.agentContext);
                delete this.tenantAgentContextMapping[agentContext.contextCorrelationId];
            }
        });
        // Release a session so new sessions can be acquired
        this.sessionMutex.releaseSession();
    }
    hasTenantSessionMapping(tenantId) {
        return this.tenantAgentContextMapping[tenantId] !== undefined;
    }
    getTenantSessionsMapping(tenantId) {
        let tenantSessionMapping = this.tenantAgentContextMapping[tenantId];
        if (tenantSessionMapping)
            return tenantSessionMapping;
        tenantSessionMapping = {
            sessionCount: 0,
            mutex: (0, async_mutex_1.withTimeout)(new async_mutex_1.Mutex(), 
            // NOTE: It can take a while to create an indy wallet. We're using RAW key derivation which should
            // be fast enough to not cause a problem. This wil also only be problem when the wallet is being created
            // for the first time or being acquired while wallet initialization is in progress.
            this.tenantsModuleConfig.sessionAcquireTimeout, new core_1.CredoError(`Error acquiring lock for tenant ${tenantId}. Wallet initialization or shutdown took too long.`)),
        };
        this.tenantAgentContextMapping[tenantId] = tenantSessionMapping;
        return tenantSessionMapping;
    }
    mutexForTenant(tenantId) {
        const tenantSessions = this.getTenantSessionsMapping(tenantId);
        return tenantSessions.mutex;
    }
    async createAgentContext(tenantRecord) {
        var _a, _b;
        const tenantDependencyManager = this.rootAgentContext.dependencyManager.createChild();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _c = (_b = (_a = this.rootAgentContext.config) === null || _a === void 0 ? void 0 : _a.walletConfig) !== null && _b !== void 0 ? _b : {}, { id, key, keyDerivationMethod } = _c, strippedWalletConfig = __rest(_c, ["id", "key", "keyDerivationMethod"]);
        const tenantConfig = this.rootAgentContext.config.extend(Object.assign(Object.assign({}, tenantRecord.config), { walletConfig: Object.assign(Object.assign({}, strippedWalletConfig), tenantRecord.config.walletConfig) }));
        const agentContext = new core_1.AgentContext({
            contextCorrelationId: tenantRecord.id,
            dependencyManager: tenantDependencyManager,
        });
        tenantDependencyManager.registerInstance(core_1.AgentContext, agentContext);
        tenantDependencyManager.registerInstance(core_1.AgentConfig, tenantConfig);
        // NOTE: we're using the wallet api here because that correctly handle creating if it doesn't exist yet
        // and will also write the storage version to the storage, which is needed by the update assistant. We either
        // need to move this out of the module, or just keep using the module here.
        const walletApi = agentContext.dependencyManager.resolve(core_1.WalletApi);
        if (!tenantConfig.walletConfig) {
            throw new core_1.WalletError('Cannot initialize tenant without Wallet config.');
        }
        await walletApi.initialize(tenantConfig.walletConfig);
        return agentContext;
    }
    async closeAgentContext(agentContext) {
        this.logger.debug(`Closing agent context for tenant '${agentContext.contextCorrelationId}'`);
        await agentContext.dependencyManager.dispose();
    }
};
exports.TenantSessionCoordinator = TenantSessionCoordinator;
exports.TenantSessionCoordinator = TenantSessionCoordinator = __decorate([
    (0, core_1.injectable)(),
    __param(1, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [core_1.AgentContext, Object, TenantsModuleConfig_1.TenantsModuleConfig])
], TenantSessionCoordinator);
//# sourceMappingURL=TenantSessionCoordinator.js.map