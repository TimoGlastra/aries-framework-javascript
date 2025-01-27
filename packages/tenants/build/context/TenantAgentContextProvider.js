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
exports.TenantAgentContextProvider = void 0;
const core_1 = require("@credo-ts/core");
const TenantAgent_1 = require("../TenantAgent");
const services_1 = require("../services");
const TenantSessionCoordinator_1 = require("./TenantSessionCoordinator");
let TenantAgentContextProvider = class TenantAgentContextProvider {
    constructor(tenantRecordService, rootAgentContext, eventEmitter, tenantSessionCoordinator, logger) {
        this.tenantRecordService = tenantRecordService;
        this.rootAgentContext = rootAgentContext;
        this.eventEmitter = eventEmitter;
        this.tenantSessionCoordinator = tenantSessionCoordinator;
        this.logger = logger;
        // Start listener for newly created routing keys, so we can register a mapping for each new key for the tenant
        this.listenForRoutingKeyCreatedEvents();
    }
    async getAgentContextForContextCorrelationId(contextCorrelationId) {
        // It could be that the root agent context is requested, in that case we return the root agent context
        if (contextCorrelationId === this.rootAgentContext.contextCorrelationId) {
            return this.rootAgentContext;
        }
        // TODO: maybe we can look at not having to retrieve the tenant record if there's already a context available.
        const tenantRecord = await this.tenantRecordService.getTenantById(this.rootAgentContext, contextCorrelationId);
        const shouldUpdate = !(0, core_1.isStorageUpToDate)(tenantRecord.storageVersion);
        // If the tenant storage is not up to date, and autoUpdate is disabled we throw an error
        if (shouldUpdate && !this.rootAgentContext.config.autoUpdateStorageOnStartup) {
            throw new core_1.CredoError(`Current agent storage for tenant ${tenantRecord.id} is not up to date. ` +
                `To prevent the tenant state from getting corrupted the tenant initialization is aborted. ` +
                `Make sure to update the tenant storage (currently at ${tenantRecord.storageVersion}) to the latest version (${core_1.UpdateAssistant.frameworkStorageVersion}). ` +
                `You can also downgrade your version of Credo.`);
        }
        const agentContext = await this.tenantSessionCoordinator.getContextForSession(tenantRecord, {
            runInMutex: shouldUpdate ? (agentContext) => this._updateTenantStorage(tenantRecord, agentContext) : undefined,
        });
        this.logger.debug(`Created tenant agent context for tenant '${contextCorrelationId}'`);
        return agentContext;
    }
    async getContextForInboundMessage(inboundMessage, options) {
        this.logger.debug('Getting context for inbound message in tenant agent context provider', {
            contextCorrelationId: options === null || options === void 0 ? void 0 : options.contextCorrelationId,
        });
        let tenantId = options === null || options === void 0 ? void 0 : options.contextCorrelationId;
        let recipientKeys = [];
        if (!tenantId && (0, core_1.isValidJweStructure)(inboundMessage)) {
            this.logger.trace("Inbound message is a JWE, extracting tenant id from JWE's protected header");
            recipientKeys = this.getRecipientKeysFromEncryptedMessage(inboundMessage);
            this.logger.trace(`Found ${recipientKeys.length} recipient keys in JWE's protected header`);
            // FIXME: what if there are multiple recipients in the same agent? If we receive the messages twice we will process it for
            // the first found recipient multiple times. This is however a case I've never seen before and will add quite some complexity
            // to resolve. I think we're fine to ignore this case for now.
            for (const recipientKey of recipientKeys) {
                const tenantRoutingRecord = await this.tenantRecordService.findTenantRoutingRecordByRecipientKey(this.rootAgentContext, recipientKey);
                if (tenantRoutingRecord) {
                    this.logger.debug(`Found tenant routing record for recipient key ${recipientKeys[0].fingerprint}`, {
                        tenantId: tenantRoutingRecord.tenantId,
                    });
                    tenantId = tenantRoutingRecord.tenantId;
                    break;
                }
            }
        }
        if (!tenantId) {
            this.logger.error("Couldn't determine tenant id for inbound message. Unable to create context", {
                inboundMessage,
                recipientKeys: recipientKeys.map((key) => key.fingerprint),
            });
            throw new core_1.CredoError("Couldn't determine tenant id for inbound message. Unable to create context");
        }
        const agentContext = await this.getAgentContextForContextCorrelationId(tenantId);
        return agentContext;
    }
    async endSessionForAgentContext(agentContext) {
        await this.tenantSessionCoordinator.endAgentContextSession(agentContext);
    }
    getRecipientKeysFromEncryptedMessage(jwe) {
        const jweProtected = core_1.JsonEncoder.fromBase64(jwe.protected);
        if (!Array.isArray(jweProtected.recipients))
            return [];
        const recipientKeys = [];
        for (const recipient of jweProtected.recipients) {
            // Check if recipient.header.kid is a string
            if ((0, core_1.isJsonObject)(recipient) && (0, core_1.isJsonObject)(recipient.header) && typeof recipient.header.kid === 'string') {
                // This won't work with other key types, we should detect what the encoding is of kid, and based on that
                // determine how we extract the key from the message
                const key = core_1.Key.fromPublicKeyBase58(recipient.header.kid, core_1.KeyType.Ed25519);
                recipientKeys.push(key);
            }
        }
        return recipientKeys;
    }
    async registerRecipientKeyForTenant(tenantId, recipientKey) {
        this.logger.debug(`Registering recipient key ${recipientKey.fingerprint} for tenant ${tenantId}`);
        const tenantRecord = await this.tenantRecordService.getTenantById(this.rootAgentContext, tenantId);
        await this.tenantRecordService.addTenantRoutingRecord(this.rootAgentContext, tenantRecord.id, recipientKey);
    }
    listenForRoutingKeyCreatedEvents() {
        this.logger.debug('Listening for routing key created events in tenant agent context provider');
        this.eventEmitter.on(core_1.RoutingEventTypes.RoutingCreatedEvent, async (event) => {
            const contextCorrelationId = event.metadata.contextCorrelationId;
            const recipientKey = event.payload.routing.recipientKey;
            // We don't want to register the key if it's for the root agent context
            if (contextCorrelationId === this.rootAgentContext.contextCorrelationId)
                return;
            this.logger.debug(`Received routing key created event for tenant ${contextCorrelationId}, registering recipient key ${recipientKey.fingerprint} in base wallet`);
            await this.registerRecipientKeyForTenant(contextCorrelationId, recipientKey);
        });
    }
    /**
     * Method to allow updating the tenant storage, this method can be called from the TenantsApi
     * to update the storage for a tenant manually
     */
    async updateTenantStorage(tenantRecord, updateOptions) {
        const agentContext = await this.tenantSessionCoordinator.getContextForSession(tenantRecord, {
            // runInMutex allows us to run the updateTenantStorage method in a mutex lock
            // prevent other sessions from being started while the update is in progress
            runInMutex: (agentContext) => this._updateTenantStorage(tenantRecord, agentContext, updateOptions),
        });
        // End sesion afterwards
        await agentContext.endSession();
    }
    /**
     * Handle the case where the tenant storage is outdated. If auto-update is disabled we will throw an error
     * and not update the storage. If auto-update is enabled we will update the storage.
     *
     * When this method is called we can be sure that we are in the mutex runExclusive lock and thus other sessions
     * will not be able to open a session for this tenant until we're done.
     *
     * NOTE: We don't support multi-instance locking for now. That means you can only have a single instance open and
     * it will prevent multiple processes from updating the tenant storage at the same time. However if multi-instances
     * are used, we can't prevent multiple instances from updating the tenant storage at the same time.
     * In the future we can make the tenantSessionCoordinator an interface and allowing a instance-tenant-lock as well
     * as an tenant-lock (across all instances)
     */
    async _updateTenantStorage(tenantRecord, agentContext, updateOptions) {
        var _a;
        try {
            // Update the tenant storage
            const tenantAgent = new TenantAgent_1.TenantAgent(agentContext);
            const updateAssistant = new core_1.UpdateAssistant(tenantAgent);
            await updateAssistant.initialize();
            await updateAssistant.update(Object.assign(Object.assign({}, updateOptions), { backupBeforeStorageUpdate: (_a = updateOptions === null || updateOptions === void 0 ? void 0 : updateOptions.backupBeforeStorageUpdate) !== null && _a !== void 0 ? _a : agentContext.config.backupBeforeStorageUpdate }));
            // Update the storage version in the tenant record
            tenantRecord.storageVersion = await updateAssistant.getCurrentAgentStorageVersion();
            const tenantRecordService = this.rootAgentContext.dependencyManager.resolve(services_1.TenantRecordService);
            await tenantRecordService.updateTenant(this.rootAgentContext, tenantRecord);
        }
        catch (error) {
            this.logger.error(`Error occurred while updating tenant storage for tenant ${tenantRecord.id}`, error);
            throw error;
        }
    }
};
exports.TenantAgentContextProvider = TenantAgentContextProvider;
exports.TenantAgentContextProvider = TenantAgentContextProvider = __decorate([
    (0, core_1.injectable)(),
    __param(4, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [services_1.TenantRecordService,
        core_1.AgentContext,
        core_1.EventEmitter,
        TenantSessionCoordinator_1.TenantSessionCoordinator, Object])
], TenantAgentContextProvider);
//# sourceMappingURL=TenantAgentContextProvider.js.map