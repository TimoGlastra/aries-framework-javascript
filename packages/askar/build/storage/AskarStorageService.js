"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarStorageService = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const askarError_1 = require("../utils/askarError");
const assertAskarWallet_1 = require("../utils/assertAskarWallet");
const utils_1 = require("./utils");
let AskarStorageService = class AskarStorageService {
    /** @inheritDoc */
    async save(agentContext, record) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        record.updatedAt = new Date();
        const value = core_1.JsonTransformer.serialize(record);
        const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
        try {
            await agentContext.wallet.withSession((session) => session.insert({ category: record.type, name: record.id, value, tags }));
        }
        catch (error) {
            if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.Duplicate)) {
                throw new core_1.RecordDuplicateError(`Record with id ${record.id} already exists`, { recordType: record.type });
            }
            throw new core_1.WalletError('Error saving record', { cause: error });
        }
    }
    /** @inheritDoc */
    async update(agentContext, record) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        record.updatedAt = new Date();
        const value = core_1.JsonTransformer.serialize(record);
        const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
        try {
            await agentContext.wallet.withSession((session) => session.replace({ category: record.type, name: record.id, value, tags }));
        }
        catch (error) {
            if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                    recordType: record.type,
                    cause: error,
                });
            }
            throw new core_1.WalletError('Error updating record', { cause: error });
        }
    }
    /** @inheritDoc */
    async delete(agentContext, record) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        try {
            await agentContext.wallet.withSession((session) => session.remove({ category: record.type, name: record.id }));
        }
        catch (error) {
            if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                throw new core_1.RecordNotFoundError(`record with id ${record.id} not found.`, {
                    recordType: record.type,
                    cause: error,
                });
            }
            throw new core_1.WalletError('Error deleting record', { cause: error });
        }
    }
    /** @inheritDoc */
    async deleteById(agentContext, recordClass, id) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        try {
            await agentContext.wallet.withSession((session) => session.remove({ category: recordClass.type, name: id }));
        }
        catch (error) {
            if ((0, askarError_1.isAskarError)(error, askarError_1.AskarErrorCode.NotFound)) {
                throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                    recordType: recordClass.type,
                    cause: error,
                });
            }
            throw new core_1.WalletError('Error deleting record', { cause: error });
        }
    }
    /** @inheritDoc */
    async getById(agentContext, recordClass, id) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        try {
            const record = await agentContext.wallet.withSession((session) => session.fetch({ category: recordClass.type, name: id }));
            if (!record) {
                throw new core_1.RecordNotFoundError(`record with id ${id} not found.`, {
                    recordType: recordClass.type,
                });
            }
            return (0, utils_1.recordToInstance)(record, recordClass);
        }
        catch (error) {
            if (error instanceof core_1.RecordNotFoundError)
                throw error;
            throw new core_1.WalletError(`Error getting record ${recordClass.name}`, { cause: error });
        }
    }
    /** @inheritDoc */
    async getAll(agentContext, recordClass) {
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        const records = await agentContext.wallet.withSession((session) => session.fetchAll({ category: recordClass.type }));
        const instances = [];
        for (const record of records) {
            instances.push((0, utils_1.recordToInstance)(record, recordClass));
        }
        return instances;
    }
    /** @inheritDoc */
    async findByQuery(agentContext, recordClass, query, queryOptions) {
        const wallet = agentContext.wallet;
        (0, assertAskarWallet_1.assertAskarWallet)(wallet);
        const askarQuery = (0, utils_1.askarQueryFromSearchQuery)(query);
        const scan = new aries_askar_shared_1.Scan({
            category: recordClass.type,
            store: wallet.store,
            tagFilter: askarQuery,
            profile: wallet.profile,
            offset: queryOptions === null || queryOptions === void 0 ? void 0 : queryOptions.offset,
            limit: queryOptions === null || queryOptions === void 0 ? void 0 : queryOptions.limit,
        });
        const instances = [];
        try {
            const records = await scan.fetchAll();
            for (const record of records) {
                instances.push((0, utils_1.recordToInstance)(record, recordClass));
            }
            return instances;
        }
        catch (error) {
            throw new core_1.WalletError(`Error executing query. ${error.message}`, { cause: error });
        }
    }
};
exports.AskarStorageService = AskarStorageService;
exports.AskarStorageService = AskarStorageService = __decorate([
    (0, core_1.injectable)()
], AskarStorageService);
//# sourceMappingURL=AskarStorageService.js.map