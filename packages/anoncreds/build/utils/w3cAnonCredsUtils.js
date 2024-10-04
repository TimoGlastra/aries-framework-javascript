"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnoncredsCredentialInfoFromRecord = getAnoncredsCredentialInfoFromRecord;
exports.getAnonCredsTagsFromRecord = getAnonCredsTagsFromRecord;
exports.getStoreCredentialOptions = getStoreCredentialOptions;
exports.getW3cRecordAnonCredsTags = getW3cRecordAnonCredsTags;
const core_1 = require("@credo-ts/core");
const credential_1 = require("./credential");
const indyIdentifiers_1 = require("./indyIdentifiers");
const metadata_1 = require("./metadata");
function anonCredsCredentialInfoFromW3cRecord(w3cCredentialRecord, useUnqualifiedIdentifiers) {
    var _a, _b, _c, _d;
    if (Array.isArray(w3cCredentialRecord.credential.credentialSubject)) {
        throw new core_1.CredoError('Credential subject must be an object, not an array.');
    }
    const anonCredsTags = getAnonCredsTagsFromRecord(w3cCredentialRecord);
    if (!anonCredsTags)
        throw new core_1.CredoError('AnonCreds tags not found on credential record.');
    const anonCredsCredentialMetadata = w3cCredentialRecord.metadata.get(metadata_1.W3cAnonCredsCredentialMetadataKey);
    if (!anonCredsCredentialMetadata)
        throw new core_1.CredoError('AnonCreds metadata not found on credential record.');
    const credentialDefinitionId = useUnqualifiedIdentifiers && anonCredsTags.anonCredsUnqualifiedCredentialDefinitionId
        ? anonCredsTags.anonCredsUnqualifiedCredentialDefinitionId
        : anonCredsTags.anonCredsCredentialDefinitionId;
    const schemaId = useUnqualifiedIdentifiers && anonCredsTags.anonCredsUnqualifiedSchemaId
        ? anonCredsTags.anonCredsUnqualifiedSchemaId
        : anonCredsTags.anonCredsSchemaId;
    const revocationRegistryId = useUnqualifiedIdentifiers && anonCredsTags.anonCredsUnqualifiedRevocationRegistryId
        ? anonCredsTags.anonCredsUnqualifiedRevocationRegistryId
        : (_a = anonCredsTags.anonCredsRevocationRegistryId) !== null && _a !== void 0 ? _a : null;
    return {
        attributes: (_b = w3cCredentialRecord.credential.credentialSubject.claims) !== null && _b !== void 0 ? _b : {},
        credentialId: w3cCredentialRecord.id,
        credentialDefinitionId,
        schemaId,
        revocationRegistryId,
        credentialRevocationId: (_c = anonCredsCredentialMetadata.credentialRevocationId) !== null && _c !== void 0 ? _c : null,
        methodName: anonCredsCredentialMetadata.methodName,
        linkSecretId: anonCredsCredentialMetadata.linkSecretId,
        createdAt: w3cCredentialRecord.createdAt,
        updatedAt: (_d = w3cCredentialRecord.updatedAt) !== null && _d !== void 0 ? _d : w3cCredentialRecord.createdAt,
    };
}
function anonCredsCredentialInfoFromAnonCredsRecord(anonCredsCredentialRecord) {
    var _a, _b, _c;
    const attributes = {};
    for (const attribute in anonCredsCredentialRecord.credential) {
        attributes[attribute] = anonCredsCredentialRecord.credential.values[attribute].raw;
    }
    return {
        attributes,
        credentialDefinitionId: anonCredsCredentialRecord.credential.cred_def_id,
        credentialId: anonCredsCredentialRecord.credentialId,
        schemaId: anonCredsCredentialRecord.credential.schema_id,
        credentialRevocationId: (_a = anonCredsCredentialRecord.credentialRevocationId) !== null && _a !== void 0 ? _a : null,
        revocationRegistryId: (_b = anonCredsCredentialRecord.credential.rev_reg_id) !== null && _b !== void 0 ? _b : null,
        methodName: anonCredsCredentialRecord.methodName,
        linkSecretId: anonCredsCredentialRecord.linkSecretId,
        createdAt: anonCredsCredentialRecord.createdAt,
        updatedAt: (_c = anonCredsCredentialRecord.updatedAt) !== null && _c !== void 0 ? _c : anonCredsCredentialRecord.createdAt,
    };
}
function getAnoncredsCredentialInfoFromRecord(credentialRecord, useUnqualifiedIdentifiersIfPresent) {
    if (credentialRecord instanceof core_1.W3cCredentialRecord) {
        return anonCredsCredentialInfoFromW3cRecord(credentialRecord, useUnqualifiedIdentifiersIfPresent);
    }
    else {
        return anonCredsCredentialInfoFromAnonCredsRecord(credentialRecord);
    }
}
function getAnonCredsTagsFromRecord(record) {
    const anoncredsMetadata = record.metadata.get(metadata_1.W3cAnonCredsCredentialMetadataKey);
    if (!anoncredsMetadata)
        return undefined;
    const tags = record.getTags();
    if (!tags.anonCredsLinkSecretId ||
        !tags.anonCredsMethodName ||
        !tags.anonCredsSchemaId ||
        !tags.anonCredsSchemaName ||
        !tags.anonCredsSchemaVersion ||
        !tags.anonCredsSchemaIssuerId ||
        !tags.anonCredsCredentialDefinitionId) {
        return undefined;
    }
    return Object.fromEntries(Object.entries(tags).filter(([key]) => key.startsWith('anonCreds')));
}
function getStoreCredentialOptions(options, indyNamespace) {
    const { credentialRequestMetadata, credentialDefinitionId, schema, credential, credentialDefinition, revocationRegistry, } = options;
    const storeCredentialOptions = {
        credentialId: core_1.utils.uuid(),
        credentialRequestMetadata,
        credential,
        credentialDefinitionId: (0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credentialDefinitionId)
            ? (0, indyIdentifiers_1.getQualifiedDidIndyDid)(credentialDefinitionId, indyNamespace)
            : credentialDefinitionId,
        credentialDefinition: (0, indyIdentifiers_1.isUnqualifiedDidIndyCredentialDefinition)(credentialDefinition)
            ? (0, indyIdentifiers_1.getQualifiedDidIndyCredentialDefinition)(credentialDefinition, indyNamespace)
            : credentialDefinition,
        schema: (0, indyIdentifiers_1.isUnqualifiedDidIndySchema)(schema) ? (0, indyIdentifiers_1.getQualifiedDidIndySchema)(schema, indyNamespace) : schema,
        revocationRegistry: (revocationRegistry === null || revocationRegistry === void 0 ? void 0 : revocationRegistry.definition)
            ? {
                definition: (0, indyIdentifiers_1.isUnqualifiedDidIndyRevocationRegistryDefinition)(revocationRegistry.definition)
                    ? (0, indyIdentifiers_1.getQualifiedDidIndyRevocationRegistryDefinition)(revocationRegistry.definition, indyNamespace)
                    : revocationRegistry.definition,
                id: (0, indyIdentifiers_1.isUnqualifiedRevocationRegistryId)(revocationRegistry.id)
                    ? (0, indyIdentifiers_1.getQualifiedDidIndyDid)(revocationRegistry.id, indyNamespace)
                    : revocationRegistry.id,
            }
            : undefined,
    };
    return storeCredentialOptions;
}
function getW3cRecordAnonCredsTags(options) {
    var _a;
    const { credentialSubject, issuerId, schema, schemaId, credentialDefinitionId, revocationRegistryId, credentialRevocationId, linkSecretId, methodName, } = options;
    const anonCredsCredentialRecordTags = Object.assign({ anonCredsLinkSecretId: linkSecretId, anonCredsCredentialDefinitionId: credentialDefinitionId, anonCredsSchemaId: schemaId, anonCredsSchemaName: schema.name, anonCredsSchemaIssuerId: schema.issuerId, anonCredsSchemaVersion: schema.version, anonCredsMethodName: methodName, anonCredsRevocationRegistryId: revocationRegistryId, anonCredsCredentialRevocationId: credentialRevocationId }, (((0, indyIdentifiers_1.isIndyDid)(issuerId) || (0, indyIdentifiers_1.isUnqualifiedIndyDid)(issuerId)) && {
        anonCredsUnqualifiedIssuerId: (0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(issuerId),
        anonCredsUnqualifiedCredentialDefinitionId: (0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(credentialDefinitionId),
        anonCredsUnqualifiedSchemaId: (0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(schemaId),
        anonCredsUnqualifiedSchemaIssuerId: (0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(schema.issuerId),
        anonCredsUnqualifiedRevocationRegistryId: revocationRegistryId
            ? (0, indyIdentifiers_1.getUnQualifiedDidIndyDid)(revocationRegistryId)
            : undefined,
    }));
    const values = (0, credential_1.mapAttributeRawValuesToAnonCredsCredentialValues)((_a = credentialSubject.claims) !== null && _a !== void 0 ? _a : {});
    for (const [key, value] of Object.entries(values)) {
        anonCredsCredentialRecordTags[`anonCredsAttr::${key}::value`] = value.raw;
        anonCredsCredentialRecordTags[`anonCredsAttr::${key}::marker`] = true;
    }
    return anonCredsCredentialRecordTags;
}
//# sourceMappingURL=w3cAnonCredsUtils.js.map