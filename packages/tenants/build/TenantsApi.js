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
exports.TenantsApi = void 0;
const core_1 = require("@credo-ts/core");
const TenantAgent_1 = require("./TenantAgent");
const TenantAgentContextProvider_1 = require("./context/TenantAgentContextProvider");
const services_1 = require("./services");
let TenantsApi = class TenantsApi {
    constructor(tenantRecordService, rootAgentContext, agentContextProvider, logger) {
        this.tenantRecordService = tenantRecordService;
        this.rootAgentContext = rootAgentContext;
        this.agentContextProvider = agentContextProvider;
        this.logger = logger;
    }
    async getTenantAgent({ tenantId }) {
        this.logger.debug(`Getting tenant agent for tenant '${tenantId}'`);
        const tenantContext = await this.agentContextProvider.getAgentContextForContextCorrelationId(tenantId);
        this.logger.trace(`Got tenant context for tenant '${tenantId}'`);
        const tenantAgent = new TenantAgent_1.TenantAgent(tenantContext);
        await tenantAgent.initialize();
        this.logger.trace(`Initializing tenant agent for tenant '${tenantId}'`);
        return tenantAgent;
    }
    async withTenantAgent(options, withTenantAgentCallback) {
        this.logger.debug(`Getting tenant agent for tenant '${options.tenantId}' in with tenant agent callback`);
        const tenantAgent = await this.getTenantAgent(options);
        try {
            this.logger.debug(`Calling tenant agent callback for tenant '${options.tenantId}'`);
            const result = await withTenantAgentCallback(tenantAgent);
            return result;
        }
        catch (error) {
            this.logger.error(`Error in tenant agent callback for tenant '${options.tenantId}'`, { error });
            throw error;
        }
        finally {
            this.logger.debug(`Ending tenant agent session for tenant '${options.tenantId}'`);
            await tenantAgent.endSession();
        }
    }
    async createTenant(options) {
        this.logger.debug(`Creating tenant with label ${options.config.label}`);
        const tenantRecord = await this.tenantRecordService.createTenant(this.rootAgentContext, options.config);
        // This initializes the tenant agent, creates the wallet etc...
        const tenantAgent = await this.getTenantAgent({ tenantId: tenantRecord.id });
        await tenantAgent.endSession();
        this.logger.info(`Successfully created tenant '${tenantRecord.id}'`);
        return tenantRecord;
    }
    async getTenantById(tenantId) {
        this.logger.debug(`Getting tenant by id '${tenantId}'`);
        return this.tenantRecordService.getTenantById(this.rootAgentContext, tenantId);
    }
    async findTenantsByLabel(label) {
        this.logger.debug(`Finding tenants by label '${label}'`);
        return this.tenantRecordService.findTenantsByLabel(this.rootAgentContext, label);
    }
    async deleteTenantById(tenantId) {
        this.logger.debug(`Deleting tenant by id '${tenantId}'`);
        // TODO: force remove context from the context provider (or session manager)
        const tenantAgent = await this.getTenantAgent({ tenantId });
        this.logger.trace(`Deleting wallet for tenant '${tenantId}'`);
        await tenantAgent.wallet.delete();
        this.logger.trace(`Shutting down agent for tenant '${tenantId}'`);
        await tenantAgent.endSession();
        return this.tenantRecordService.deleteTenantById(this.rootAgentContext, tenantId);
    }
    async updateTenant(tenant) {
        await this.tenantRecordService.updateTenant(this.rootAgentContext, tenant);
    }
    async findTenantsByQuery(query, queryOptions) {
        return this.tenantRecordService.findTenantsByQuery(this.rootAgentContext, query, queryOptions);
    }
    async getAllTenants() {
        this.logger.debug('Getting all tenants');
        return this.tenantRecordService.getAllTenants(this.rootAgentContext);
    }
    async updateTenantStorage({ tenantId, updateOptions }) {
        this.logger.debug(`Updating tenant storage for tenant '${tenantId}'`);
        const tenantRecord = await this.tenantRecordService.getTenantById(this.rootAgentContext, tenantId);
        if ((0, core_1.isStorageUpToDate)(tenantRecord.storageVersion)) {
            this.logger.debug(`Tenant storage for tenant '${tenantId}' is already up to date. Skipping update`);
            return;
        }
        await this.agentContextProvider.updateTenantStorage(tenantRecord, updateOptions);
    }
    async getTenantsWithOutdatedStorage() {
        const outdatedTenants = await this.tenantRecordService.findTenantsByQuery(this.rootAgentContext, {
            $not: {
                storageVersion: core_1.UpdateAssistant.frameworkStorageVersion,
            },
        });
        return outdatedTenants;
    }
};
exports.TenantsApi = TenantsApi;
exports.TenantsApi = TenantsApi = __decorate([
    (0, core_1.injectable)(),
    __param(2, (0, core_1.inject)(core_1.InjectionSymbols.AgentContextProvider)),
    __param(3, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [services_1.TenantRecordService,
        core_1.AgentContext,
        TenantAgentContextProvider_1.TenantAgentContextProvider, Object])
], TenantsApi);
//# sourceMappingURL=TenantsApi.js.map