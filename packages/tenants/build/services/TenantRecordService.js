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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRecordService = void 0;
const core_1 = require("@credo-ts/core");
const repository_1 = require("../repository");
let TenantRecordService = class TenantRecordService {
    constructor(tenantRepository, tenantRoutingRepository) {
        this.tenantRepository = tenantRepository;
        this.tenantRoutingRepository = tenantRoutingRepository;
    }
    async createTenant(agentContext, config) {
        const tenantId = core_1.utils.uuid();
        const walletId = `tenant-${tenantId}`;
        const walletKey = await agentContext.wallet.generateWalletKey();
        const tenantRecord = new repository_1.TenantRecord({
            id: tenantId,
            config: Object.assign(Object.assign({}, config), { walletConfig: {
                    id: walletId,
                    key: walletKey,
                    keyDerivationMethod: core_1.KeyDerivationMethod.Raw,
                } }),
            storageVersion: core_1.UpdateAssistant.frameworkStorageVersion,
        });
        await this.tenantRepository.save(agentContext, tenantRecord);
        return tenantRecord;
    }
    async getTenantById(agentContext, tenantId) {
        return this.tenantRepository.getById(agentContext, tenantId);
    }
    async findTenantsByLabel(agentContext, label) {
        return this.tenantRepository.findByLabel(agentContext, label);
    }
    async getAllTenants(agentContext) {
        return this.tenantRepository.getAll(agentContext);
    }
    async deleteTenantById(agentContext, tenantId) {
        const tenantRecord = await this.getTenantById(agentContext, tenantId);
        const tenantRoutingRecords = await this.tenantRoutingRepository.findByQuery(agentContext, {
            tenantId: tenantRecord.id,
        });
        // Delete all tenant routing records
        await Promise.all(tenantRoutingRecords.map((tenantRoutingRecord) => this.tenantRoutingRepository.delete(agentContext, tenantRoutingRecord)));
        // Delete tenant record
        await this.tenantRepository.delete(agentContext, tenantRecord);
    }
    async updateTenant(agentContext, tenantRecord) {
        return this.tenantRepository.update(agentContext, tenantRecord);
    }
    async findTenantsByQuery(agentContext, query, queryOptions) {
        return this.tenantRepository.findByQuery(agentContext, query, queryOptions);
    }
    async findTenantRoutingRecordByRecipientKey(agentContext, recipientKey) {
        return this.tenantRoutingRepository.findByRecipientKey(agentContext, recipientKey);
    }
    async addTenantRoutingRecord(agentContext, tenantId, recipientKey) {
        const tenantRoutingRecord = new repository_1.TenantRoutingRecord({
            tenantId,
            recipientKeyFingerprint: recipientKey.fingerprint,
        });
        await this.tenantRoutingRepository.save(agentContext, tenantRoutingRecord);
        return tenantRoutingRecord;
    }
};
exports.TenantRecordService = TenantRecordService;
exports.TenantRecordService = TenantRecordService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [repository_1.TenantRepository, repository_1.TenantRoutingRepository])
], TenantRecordService);
//# sourceMappingURL=TenantRecordService.js.map