"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAnonCredsInW3cFormatV0_5 = storeAnonCredsInW3cFormatV0_5;
const core_1 = require("@credo-ts/core");
const repository_1 = require("../../repository");
const services_1 = require("../../services");
const anonCredsObjects_1 = require("../../utils/anonCredsObjects");
const indyIdentifiers_1 = require("../../utils/indyIdentifiers");
const metadata_1 = require("../../utils/metadata");
const w3cAnonCredsUtils_1 = require("../../utils/w3cAnonCredsUtils");
async function getIndyNamespace(agentContext, legacyCredentialDefinitionId, legacyIssuerId) {
    var _a;
    const cacheModuleConfig = agentContext.dependencyManager.resolve(core_1.CacheModuleConfig);
    const cache = cacheModuleConfig.cache;
    const indyCacheKey = `IndyVdrPoolService:${legacyIssuerId}`;
    const sovCacheKey = `IndySdkPoolService:${legacyIssuerId}`;
    const cachedNymResponse = (_a = (await cache.get(agentContext, indyCacheKey))) !== null && _a !== void 0 ? _a : (await cache.get(agentContext, sovCacheKey));
    if (!(cachedNymResponse === null || cachedNymResponse === void 0 ? void 0 : cachedNymResponse.indyNamespace) || typeof (cachedNymResponse === null || cachedNymResponse === void 0 ? void 0 : cachedNymResponse.indyNamespace) !== 'string') {
        const credentialDefinitionReturn = await (0, anonCredsObjects_1.fetchCredentialDefinition)(agentContext, legacyCredentialDefinitionId);
        const namespace = credentialDefinitionReturn.indyNamespace;
        if (!namespace) {
            throw new core_1.CredoError('Could not determine the indyNamespace required for storing anoncreds in the new w3c format.');
        }
        return namespace;
    }
    else {
        return cachedNymResponse.indyNamespace;
    }
}
async function migrateLegacyToW3cCredential(agentContext, legacyRecord) {
    const legacyTags = legacyRecord.getTags();
    let indyNamespace;
    let qualifiedSchemaId;
    let qualifiedSchemaIssuerId;
    let qualifiedCredentialDefinitionId;
    let qualifiedIssuerId;
    let qualifiedRevocationRegistryId;
    if (!(0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(legacyTags.credentialDefinitionId) &&
        !(0, indyIdentifiers_1.isUnqualifiedIndyDid)(legacyTags.issuerId)) {
        if ((0, indyIdentifiers_1.isIndyDid)(legacyTags.issuerId)) {
            indyNamespace = (0, indyIdentifiers_1.getIndyNamespaceFromIndyDid)(legacyTags.issuerId);
        }
    }
    else {
        indyNamespace = await getIndyNamespace(agentContext, legacyTags.credentialDefinitionId, legacyTags.issuerId);
    }
    if (indyNamespace) {
        qualifiedCredentialDefinitionId = (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.credentialDefinitionId, indyNamespace);
        qualifiedIssuerId = (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.issuerId, indyNamespace);
        qualifiedRevocationRegistryId = legacyTags.revocationRegistryId
            ? (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.revocationRegistryId, indyNamespace)
            : undefined;
        qualifiedSchemaId = (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.schemaId, indyNamespace);
        qualifiedSchemaIssuerId = (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.schemaIssuerId, indyNamespace);
    }
    else {
        qualifiedCredentialDefinitionId = legacyTags.credentialDefinitionId;
        qualifiedIssuerId = legacyTags.issuerId;
        qualifiedRevocationRegistryId = legacyTags.revocationRegistryId;
        qualifiedSchemaId = legacyTags.schemaId;
        qualifiedSchemaIssuerId = legacyTags.schemaIssuerId;
    }
    const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
    const w3cJsonLdCredential = await anonCredsHolderService.legacyToW3cCredential(agentContext, {
        credential: legacyRecord.credential,
        issuerId: qualifiedIssuerId,
    });
    if (Array.isArray(w3cJsonLdCredential.credentialSubject)) {
        throw new core_1.CredoError('Credential subject must be an object, not an array.');
    }
    const anonCredsTags = (0, w3cAnonCredsUtils_1.getW3cRecordAnonCredsTags)({
        credentialSubject: w3cJsonLdCredential.credentialSubject,
        issuerId: w3cJsonLdCredential.issuerId,
        schemaId: qualifiedSchemaId,
        schema: {
            issuerId: qualifiedSchemaIssuerId,
            name: legacyTags.schemaName,
            version: legacyTags.schemaVersion,
        },
        credentialRevocationId: legacyTags.credentialRevocationId,
        revocationRegistryId: qualifiedRevocationRegistryId,
        credentialDefinitionId: qualifiedCredentialDefinitionId,
        linkSecretId: legacyTags.linkSecretId,
        methodName: legacyTags.methodName,
    });
    const w3cCredentialService = agentContext.dependencyManager.resolve(core_1.W3cCredentialService);
    const w3cCredentialRecord = await w3cCredentialService.storeCredential(agentContext, {
        credential: w3cJsonLdCredential,
    });
    for (const [key, meta] of Object.entries(legacyRecord.metadata.data)) {
        w3cCredentialRecord.metadata.set(key, meta);
    }
    const anonCredsCredentialMetadata = {
        credentialRevocationId: anonCredsTags.anonCredsCredentialRevocationId,
        linkSecretId: anonCredsTags.anonCredsLinkSecretId,
        methodName: anonCredsTags.anonCredsMethodName,
    };
    w3cCredentialRecord.setTags(anonCredsTags);
    w3cCredentialRecord.metadata.set(metadata_1.W3cAnonCredsCredentialMetadataKey, anonCredsCredentialMetadata);
    const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
    await w3cCredentialRepository.update(agentContext, w3cCredentialRecord);
    // Find the credential exchange record bound to this anoncreds credential and update it to point to the newly created w3c record
    const credentialExchangeRepository = agentContext.dependencyManager.resolve(core_1.CredentialRepository);
    const [relatedCredentialExchangeRecord] = await credentialExchangeRepository.findByQuery(agentContext, {
        credentialIds: [legacyRecord.credentialId],
    });
    if (relatedCredentialExchangeRecord) {
        // Replace the related binding by the new one
        const credentialBindingIndex = relatedCredentialExchangeRecord.credentials.findIndex((binding) => binding.credentialRecordId === legacyRecord.credentialId);
        if (credentialBindingIndex !== -1) {
            relatedCredentialExchangeRecord.credentials[credentialBindingIndex] = {
                credentialRecordType: 'w3c',
                credentialRecordId: w3cCredentialRecord.id,
            };
            // If using Indy dids, store both qualified/unqualified revRegId forms
            // to allow retrieving it from revocation notification service
            if (legacyTags.revocationRegistryId && indyNamespace) {
                const { credentialDefinitionTag, namespaceIdentifier, revocationRegistryTag, schemaSeqNo } = (0, indyIdentifiers_1.parseIndyRevocationRegistryId)(legacyTags.revocationRegistryId);
                relatedCredentialExchangeRecord.setTags({
                    anonCredsRevocationRegistryId: (0, indyIdentifiers_1.getQualifiedDidIndyDid)(legacyTags.revocationRegistryId, indyNamespace),
                    anonCredsUnqualifiedRevocationRegistryId: (0, indyIdentifiers_1.getUnqualifiedRevocationRegistryDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag),
                });
            }
            await credentialExchangeRepository.update(agentContext, relatedCredentialExchangeRecord);
        }
    }
}
/**
 * Stores all anoncreds credentials in the new w3c format
 */
async function storeAnonCredsInW3cFormatV0_5(agent) {
    agent.config.logger.info('Migration of legacy AnonCreds records to the new W3C format version 0.5');
    const anoncredsRepository = agent.dependencyManager.resolve(repository_1.AnonCredsCredentialRepository);
    agent.config.logger.debug(`Fetching all anoncreds credential records from storage`);
    const records = await anoncredsRepository.getAll(agent.context);
    agent.config.logger.debug(`Found a total of ${records.length} legacy anonCreds credential records to update.`);
    for (const record of records) {
        agent.config.logger.debug(`Re-saving anonCreds credential record with id ${record.id} in the new w3c format, and deleting the legacy record`);
        try {
            await migrateLegacyToW3cCredential(agent.context, record);
            await anoncredsRepository.delete(agent.context, record);
            agent.config.logger.debug(`Successfully migrated w3c credential record with id ${record.id} to storage version 0.5`);
        }
        catch (error) {
            agent.config.logger.error(`Failed to migrate w3c credential record with id ${record.id} to storage version 0.5`, error);
        }
    }
}
//# sourceMappingURL=anonCredsCredentialRecord.js.map