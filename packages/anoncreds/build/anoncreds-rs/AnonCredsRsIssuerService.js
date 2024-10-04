"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsIssuerService = void 0;
const core_1 = require("@credo-ts/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const error_1 = require("../error");
const repository_1 = require("../repository");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
let AnonCredsRsIssuerService = class AnonCredsRsIssuerService {
    async createSchema(agentContext, options) {
        const { issuerId, name, version, attrNames: attributeNames } = options;
        let schema;
        try {
            const schema = anoncreds_shared_1.Schema.create({
                issuerId,
                name,
                version,
                attributeNames,
            });
            return schema.toJson();
        }
        finally {
            schema === null || schema === void 0 ? void 0 : schema.handle.clear();
        }
    }
    async createCredentialDefinition(agentContext, options) {
        const { tag, supportRevocation, schema, issuerId, schemaId } = options;
        let createReturnObj;
        try {
            createReturnObj = anoncreds_shared_1.CredentialDefinition.create({
                schema: schema,
                issuerId,
                schemaId,
                tag,
                supportRevocation,
                signatureType: 'CL',
            });
            return {
                credentialDefinition: createReturnObj.credentialDefinition.toJson(),
                credentialDefinitionPrivate: createReturnObj.credentialDefinitionPrivate.toJson(),
                keyCorrectnessProof: createReturnObj.keyCorrectnessProof.toJson(),
            };
        }
        finally {
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialDefinition.handle.clear();
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialDefinitionPrivate.handle.clear();
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.keyCorrectnessProof.handle.clear();
        }
    }
    async createRevocationRegistryDefinition(agentContext, options) {
        const { tag, issuerId, credentialDefinition, credentialDefinitionId, maximumCredentialNumber, tailsDirectoryPath } = options;
        let createReturnObj;
        try {
            createReturnObj = anoncreds_shared_1.RevocationRegistryDefinition.create({
                credentialDefinition: credentialDefinition,
                credentialDefinitionId,
                issuerId,
                maximumCredentialNumber,
                revocationRegistryType: 'CL_ACCUM',
                tag,
                tailsDirectoryPath,
            });
            return {
                revocationRegistryDefinition: createReturnObj.revocationRegistryDefinition.toJson(),
                revocationRegistryDefinitionPrivate: createReturnObj.revocationRegistryDefinitionPrivate.toJson(),
            };
        }
        finally {
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.revocationRegistryDefinition.handle.clear();
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.revocationRegistryDefinitionPrivate.handle.clear();
        }
    }
    async createRevocationStatusList(agentContext, options) {
        const { issuerId, revocationRegistryDefinitionId, revocationRegistryDefinition } = options;
        const credentialDefinitionRecord = await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
            .getByCredentialDefinitionId(agentContext, revocationRegistryDefinition.credDefId);
        const revocationRegistryDefinitionPrivateRecord = await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository)
            .getByRevocationRegistryDefinitionId(agentContext, revocationRegistryDefinitionId);
        let revocationStatusList;
        try {
            revocationStatusList = anoncreds_shared_1.RevocationStatusList.create({
                issuanceByDefault: true,
                revocationRegistryDefinitionId,
                credentialDefinition: credentialDefinitionRecord.credentialDefinition,
                revocationRegistryDefinition: revocationRegistryDefinition,
                revocationRegistryDefinitionPrivate: revocationRegistryDefinitionPrivateRecord.value,
                issuerId,
            });
            return revocationStatusList.toJson();
        }
        finally {
            revocationStatusList === null || revocationStatusList === void 0 ? void 0 : revocationStatusList.handle.clear();
        }
    }
    async updateRevocationStatusList(agentContext, options) {
        const { revocationStatusList, revocationRegistryDefinition, issued, revoked, timestamp, tailsFilePath } = options;
        let updatedRevocationStatusList;
        let revocationRegistryDefinitionObj;
        try {
            updatedRevocationStatusList = anoncreds_shared_1.RevocationStatusList.fromJson(revocationStatusList);
            if (timestamp && !issued && !revoked) {
                updatedRevocationStatusList.updateTimestamp({
                    timestamp,
                });
            }
            else {
                const credentialDefinitionRecord = await agentContext.dependencyManager
                    .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
                    .getByCredentialDefinitionId(agentContext, revocationRegistryDefinition.credDefId);
                const revocationRegistryDefinitionPrivateRecord = await agentContext.dependencyManager
                    .resolve(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository)
                    .getByRevocationRegistryDefinitionId(agentContext, revocationStatusList.revRegDefId);
                revocationRegistryDefinitionObj = anoncreds_shared_1.RevocationRegistryDefinition.fromJson(Object.assign(Object.assign({}, revocationRegistryDefinition), { value: Object.assign(Object.assign({}, revocationRegistryDefinition.value), { tailsLocation: tailsFilePath }) }));
                updatedRevocationStatusList.update({
                    credentialDefinition: credentialDefinitionRecord.credentialDefinition,
                    revocationRegistryDefinition: revocationRegistryDefinitionObj,
                    revocationRegistryDefinitionPrivate: revocationRegistryDefinitionPrivateRecord.value,
                    issued: options.issued,
                    revoked: options.revoked,
                    timestamp: timestamp !== null && timestamp !== void 0 ? timestamp : -1, // FIXME: this should be fixed in anoncreds-rs wrapper
                });
            }
            return updatedRevocationStatusList.toJson();
        }
        finally {
            updatedRevocationStatusList === null || updatedRevocationStatusList === void 0 ? void 0 : updatedRevocationStatusList.handle.clear();
            revocationRegistryDefinitionObj === null || revocationRegistryDefinitionObj === void 0 ? void 0 : revocationRegistryDefinitionObj.handle.clear();
        }
    }
    async createCredentialOffer(agentContext, options) {
        const { credentialDefinitionId } = options;
        let credentialOffer;
        try {
            // The getByCredentialDefinitionId supports both qualified and unqualified identifiers, even though the
            // record is always stored using the qualified identifier.
            const credentialDefinitionRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
                .getByCredentialDefinitionId(agentContext, options.credentialDefinitionId);
            // We fetch the keyCorrectnessProof based on the credential definition record id, as the
            // credential definition id passed to this module could be unqualified, and the key correctness
            // proof is only stored using the qualified identifier.
            const keyCorrectnessProofRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsKeyCorrectnessProofRepository)
                .getByCredentialDefinitionId(agentContext, credentialDefinitionRecord.credentialDefinitionId);
            if (!credentialDefinitionRecord) {
                throw new error_1.AnonCredsRsError(`Credential Definition ${credentialDefinitionId} not found`);
            }
            let schemaId = credentialDefinitionRecord.credentialDefinition.schemaId;
            // if the credentialDefinitionId is not qualified, we need to transform the schemaId to also be unqualified
            if ((0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(options.credentialDefinitionId)) {
                const { namespaceIdentifier, schemaName, schemaVersion } = (0, indyIdentifiers_1.parseIndySchemaId)(schemaId);
                schemaId = (0, indyIdentifiers_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
            }
            credentialOffer = anoncreds_shared_1.CredentialOffer.create({
                credentialDefinitionId,
                keyCorrectnessProof: keyCorrectnessProofRecord === null || keyCorrectnessProofRecord === void 0 ? void 0 : keyCorrectnessProofRecord.value,
                schemaId,
            });
            return credentialOffer.toJson();
        }
        finally {
            credentialOffer === null || credentialOffer === void 0 ? void 0 : credentialOffer.handle.clear();
        }
    }
    async createCredential(agentContext, options) {
        var _a;
        const { credentialOffer, credentialRequest, credentialValues, revocationRegistryDefinitionId, revocationStatusList, revocationRegistryIndex, } = options;
        const definedRevocationOptions = [
            revocationRegistryDefinitionId,
            revocationStatusList,
            revocationRegistryIndex,
        ].filter((e) => e !== undefined);
        if (definedRevocationOptions.length > 0 && definedRevocationOptions.length < 3) {
            throw new core_1.CredoError('Revocation requires all of revocationRegistryDefinitionId, revocationRegistryIndex and revocationStatusList');
        }
        let credential;
        try {
            const attributeRawValues = {};
            const attributeEncodedValues = {};
            Object.keys(credentialValues).forEach((key) => {
                attributeRawValues[key] = credentialValues[key].raw;
                attributeEncodedValues[key] = credentialValues[key].encoded;
            });
            const credentialDefinitionRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsCredentialDefinitionRepository)
                .getByCredentialDefinitionId(agentContext, options.credentialRequest.cred_def_id);
            // We fetch the private record based on the cred def id from the cred def record, as the
            // credential definition id passed to this module could be unqualified, and the private record
            // is only stored using the qualified identifier.
            const credentialDefinitionPrivateRecord = await agentContext.dependencyManager
                .resolve(repository_1.AnonCredsCredentialDefinitionPrivateRepository)
                .getByCredentialDefinitionId(agentContext, credentialDefinitionRecord.credentialDefinitionId);
            let credentialDefinition = credentialDefinitionRecord.credentialDefinition;
            if ((0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(options.credentialRequest.cred_def_id)) {
                const { namespaceIdentifier, schemaName, schemaVersion } = (0, indyIdentifiers_1.parseIndySchemaId)(credentialDefinition.schemaId);
                const { namespaceIdentifier: unqualifiedDid } = (0, indyIdentifiers_1.parseIndyDid)(credentialDefinition.issuerId);
                credentialDefinition = Object.assign(Object.assign({}, credentialDefinition), { schemaId: (0, indyIdentifiers_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion), issuerId: unqualifiedDid });
            }
            let revocationConfiguration;
            if (revocationRegistryDefinitionId && revocationStatusList && revocationRegistryIndex) {
                const revocationRegistryDefinitionRecord = await agentContext.dependencyManager
                    .resolve(repository_1.AnonCredsRevocationRegistryDefinitionRepository)
                    .getByRevocationRegistryDefinitionId(agentContext, revocationRegistryDefinitionId);
                const revocationRegistryDefinitionPrivateRecord = await agentContext.dependencyManager
                    .resolve(repository_1.AnonCredsRevocationRegistryDefinitionPrivateRepository)
                    .getByRevocationRegistryDefinitionId(agentContext, revocationRegistryDefinitionId);
                if (revocationRegistryIndex >= revocationRegistryDefinitionRecord.revocationRegistryDefinition.value.maxCredNum) {
                    revocationRegistryDefinitionPrivateRecord.state = repository_1.AnonCredsRevocationRegistryState.Full;
                }
                revocationConfiguration = new anoncreds_shared_1.CredentialRevocationConfig({
                    registryDefinition: anoncreds_shared_1.RevocationRegistryDefinition.fromJson(revocationRegistryDefinitionRecord.revocationRegistryDefinition),
                    registryDefinitionPrivate: anoncreds_shared_1.RevocationRegistryDefinitionPrivate.fromJson(revocationRegistryDefinitionPrivateRecord.value),
                    statusList: anoncreds_shared_1.RevocationStatusList.fromJson(revocationStatusList),
                    registryIndex: revocationRegistryIndex,
                });
            }
            credential = anoncreds_shared_1.Credential.create({
                credentialDefinition: credentialDefinitionRecord.credentialDefinition,
                credentialOffer: credentialOffer,
                credentialRequest: credentialRequest,
                revocationRegistryId: revocationRegistryDefinitionId,
                attributeEncodedValues,
                attributeRawValues,
                credentialDefinitionPrivate: credentialDefinitionPrivateRecord.value,
                revocationConfiguration,
                // FIXME: duplicated input parameter?
                revocationStatusList: revocationStatusList
                    ? anoncreds_shared_1.RevocationStatusList.fromJson(revocationStatusList)
                    : undefined,
            });
            return {
                credential: credential.toJson(),
                credentialRevocationId: (_a = credential.revocationRegistryIndex) === null || _a === void 0 ? void 0 : _a.toString(),
            };
        }
        finally {
            credential === null || credential === void 0 ? void 0 : credential.handle.clear();
        }
    }
};
exports.AnonCredsRsIssuerService = AnonCredsRsIssuerService;
exports.AnonCredsRsIssuerService = AnonCredsRsIssuerService = __decorate([
    (0, core_1.injectable)()
], AnonCredsRsIssuerService);
//# sourceMappingURL=AnonCredsRsIssuerService.js.map