"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSchema = fetchSchema;
exports.fetchCredentialDefinition = fetchCredentialDefinition;
exports.fetchRevocationRegistryDefinition = fetchRevocationRegistryDefinition;
exports.fetchRevocationStatusList = fetchRevocationStatusList;
exports.fetchSchemas = fetchSchemas;
exports.fetchCredentialDefinitions = fetchCredentialDefinitions;
const core_1 = require("@credo-ts/core");
const services_1 = require("../services");
async function fetchSchema(agentContext, schemaId) {
    const registryService = agentContext.dependencyManager.resolve(services_1.AnonCredsRegistryService);
    const result = await registryService
        .getRegistryForIdentifier(agentContext, schemaId)
        .getSchema(agentContext, schemaId);
    if (!result || !result.schema) {
        throw new core_1.CredoError(`Schema not found for id ${schemaId}: ${result.resolutionMetadata.message}`);
    }
    return {
        schema: result.schema,
        schemaId: result.schemaId,
        indyNamespace: result.schemaMetadata.didIndyNamespace,
    };
}
async function fetchCredentialDefinition(agentContext, credentialDefinitionId) {
    const registryService = agentContext.dependencyManager.resolve(services_1.AnonCredsRegistryService);
    const result = await registryService
        .getRegistryForIdentifier(agentContext, credentialDefinitionId)
        .getCredentialDefinition(agentContext, credentialDefinitionId);
    if (!result || !result.credentialDefinition) {
        throw new core_1.CredoError(`Credential definition not found for id ${credentialDefinitionId}: ${result.resolutionMetadata.message}`);
    }
    const indyNamespace = result.credentialDefinitionMetadata.didIndyNamespace;
    return {
        credentialDefinition: result.credentialDefinition,
        credentialDefinitionId,
        indyNamespace: indyNamespace && typeof indyNamespace === 'string' ? indyNamespace : undefined,
    };
}
async function fetchRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
    const registryService = agentContext.dependencyManager.resolve(services_1.AnonCredsRegistryService);
    const result = await registryService
        .getRegistryForIdentifier(agentContext, revocationRegistryDefinitionId)
        .getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId);
    if (!result || !result.revocationRegistryDefinition) {
        throw new core_1.CredoError(`RevocationRegistryDefinition not found for id ${revocationRegistryDefinitionId}: ${result.resolutionMetadata.message}`);
    }
    const indyNamespace = result.revocationRegistryDefinitionMetadata.didIndyNamespace;
    return {
        revocationRegistryDefinition: result.revocationRegistryDefinition,
        revocationRegistryDefinitionId,
        indyNamespace: indyNamespace && typeof indyNamespace === 'string' ? indyNamespace : undefined,
    };
}
async function fetchRevocationStatusList(agentContext, revocationRegistryId, timestamp) {
    const registry = agentContext.dependencyManager
        .resolve(services_1.AnonCredsRegistryService)
        .getRegistryForIdentifier(agentContext, revocationRegistryId);
    const { revocationStatusList, resolutionMetadata } = await registry.getRevocationStatusList(agentContext, revocationRegistryId, timestamp);
    if (!revocationStatusList) {
        throw new core_1.CredoError(`Could not retrieve revocation status list for revocation registry ${revocationRegistryId}: ${resolutionMetadata.message}`);
    }
    return { revocationStatusList };
}
async function fetchSchemas(agentContext, schemaIds) {
    const schemaFetchPromises = [...schemaIds].map(async (schemaId) => {
        const { schema } = await fetchSchema(agentContext, schemaId);
        return [schemaId, schema];
    });
    const schemas = Object.fromEntries(await Promise.all(schemaFetchPromises));
    return schemas;
}
async function fetchCredentialDefinitions(agentContext, credentialDefinitionIds) {
    const credentialDefinitionEntries = [...credentialDefinitionIds].map(async (credentialDefinitionId) => {
        const { credentialDefinition } = await fetchCredentialDefinition(agentContext, credentialDefinitionId);
        return [credentialDefinitionId, credentialDefinition];
    });
    const credentialDefinitions = Object.fromEntries(await Promise.all(credentialDefinitionEntries));
    return credentialDefinitions;
}
//# sourceMappingURL=anonCredsObjects.js.map