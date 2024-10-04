"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsHolderService = void 0;
const core_1 = require("@credo-ts/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const AnonCredsModuleConfig_1 = require("../AnonCredsModuleConfig");
const error_1 = require("../error");
const models_1 = require("../models");
const repository_1 = require("../repository");
const services_1 = require("../services");
const utils_1 = require("../utils");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
const linkSecret_1 = require("../utils/linkSecret");
const metadata_1 = require("../utils/metadata");
const proofRequest_1 = require("../utils/proofRequest");
const w3cAnonCredsUtils_1 = require("../utils/w3cAnonCredsUtils");
const utils_2 = require("./utils");
let AnonCredsRsHolderService = class AnonCredsRsHolderService {
    constructor() {
        this.getPresentationMetadata = async (agentContext, options) => {
            const { credentialsWithMetadata, credentialsProve } = options;
            const credentials = await Promise.all(credentialsWithMetadata.map(async ({ credential, nonRevoked }) => {
                const credentialJson = core_1.JsonTransformer.toJSON(credential);
                const { revocationRegistryIndex, revocationRegistryId, timestamp } = anoncreds_shared_1.W3cCredential.fromJson(credentialJson);
                if (!nonRevoked)
                    return { credential: credentialJson, revocationState: undefined, timestamp: undefined };
                if (!revocationRegistryId || !revocationRegistryIndex)
                    throw new core_1.CredoError('Missing revocation metadata');
                const { revocationState, updatedTimestamp } = await (0, utils_2.getRevocationMetadata)(agentContext, {
                    nonRevokedInterval: nonRevoked,
                    timestamp,
                    revocationRegistryIndex,
                    revocationRegistryId,
                });
                return { credential: credentialJson, revocationState, timestamp: updatedTimestamp };
            }));
            return { credentialsProve, credentials };
        };
    }
    async createLinkSecret(agentContext, options) {
        var _a;
        return {
            linkSecretId: (_a = options === null || options === void 0 ? void 0 : options.linkSecretId) !== null && _a !== void 0 ? _a : core_1.utils.uuid(),
            linkSecretValue: anoncreds_shared_1.LinkSecret.create(),
        };
    }
    async createProof(agentContext, options) {
        const { credentialDefinitions, proofRequest, selectedCredentials, schemas } = options;
        let presentation;
        try {
            const rsCredentialDefinitions = {};
            for (const credDefId in credentialDefinitions) {
                rsCredentialDefinitions[credDefId] = credentialDefinitions[credDefId];
            }
            const rsSchemas = {};
            for (const schemaId in schemas) {
                rsSchemas[schemaId] = schemas[schemaId];
            }
            const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
            const anoncredsCredentialRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsCredentialRepository);
            // Cache retrieved credentials in order to minimize storage calls
            const retrievedCredentials = new Map();
            const credentialEntryFromAttribute = async (attribute) => {
                let credentialRecord = retrievedCredentials.get(attribute.credentialId);
                if (!credentialRecord) {
                    const w3cCredentialRecord = await w3cCredentialRepository.findById(agentContext, attribute.credentialId);
                    if (w3cCredentialRecord) {
                        credentialRecord = w3cCredentialRecord;
                        retrievedCredentials.set(attribute.credentialId, w3cCredentialRecord);
                    }
                    else {
                        credentialRecord = await anoncredsCredentialRepository.getByCredentialId(agentContext, attribute.credentialId);
                        agentContext.config.logger.warn([
                            `Creating AnonCreds proof with legacy credential ${attribute.credentialId}.`,
                            `Please run the migration script to migrate credentials to the new w3c format. See https://credo.js.org/guides/updating/versions/0.4-to-0.5 for information on how to migrate.`,
                        ].join('\n'));
                    }
                }
                const { linkSecretId, revocationRegistryId, credentialRevocationId } = (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(credentialRecord, (0, proofRequest_1.proofRequestUsesUnqualifiedIdentifiers)(proofRequest));
                // TODO: Check if credential has a revocation registry id (check response from anoncreds-rs API, as it is
                // sending back a mandatory string in Credential.revocationRegistryId)
                const timestamp = attribute.timestamp;
                let revocationState;
                let revocationRegistryDefinition;
                try {
                    if (timestamp && credentialRevocationId && revocationRegistryId) {
                        if (!options.revocationRegistries[revocationRegistryId]) {
                            throw new error_1.AnonCredsRsError(`Revocation Registry ${revocationRegistryId} not found`);
                        }
                        const { definition, revocationStatusLists, tailsFilePath } = options.revocationRegistries[revocationRegistryId];
                        // Extract revocation status list for the given timestamp
                        const revocationStatusList = revocationStatusLists[timestamp];
                        if (!revocationStatusList) {
                            throw new core_1.CredoError(`Revocation status list for revocation registry ${revocationRegistryId} and timestamp ${timestamp} not found in revocation status lists. All revocation status lists must be present.`);
                        }
                        revocationRegistryDefinition = anoncreds_shared_1.RevocationRegistryDefinition.fromJson(definition);
                        revocationState = anoncreds_shared_1.CredentialRevocationState.create({
                            revocationRegistryIndex: Number(credentialRevocationId),
                            revocationRegistryDefinition,
                            tailsPath: tailsFilePath,
                            revocationStatusList: anoncreds_shared_1.RevocationStatusList.fromJson(revocationStatusList),
                        });
                    }
                    const credential = credentialRecord instanceof core_1.W3cCredentialRecord
                        ? await this.w3cToLegacyCredential(agentContext, {
                            credential: credentialRecord.credential,
                        })
                        : credentialRecord.credential;
                    return {
                        linkSecretId,
                        credentialId: attribute.credentialId,
                        credentialEntry: {
                            credential: credential,
                            revocationState: revocationState === null || revocationState === void 0 ? void 0 : revocationState.toJson(),
                            timestamp,
                        },
                    };
                }
                finally {
                    revocationState === null || revocationState === void 0 ? void 0 : revocationState.handle.clear();
                    revocationRegistryDefinition === null || revocationRegistryDefinition === void 0 ? void 0 : revocationRegistryDefinition.handle.clear();
                }
            };
            const credentialsProve = [];
            const credentials = [];
            let entryIndex = 0;
            for (const referent in selectedCredentials.attributes) {
                const attribute = selectedCredentials.attributes[referent];
                // If the credentialId with the same timestamp is already present, we will use the existing entry, so that the proof is created
                // showing the attributes come from the same cred, rather than different ones.
                const existingCredentialIndex = credentials.findIndex((credential) => credential.credentialId === attribute.credentialId &&
                    attribute.timestamp === credential.credentialEntry.timestamp);
                if (existingCredentialIndex !== -1) {
                    credentialsProve.push({
                        entryIndex: existingCredentialIndex,
                        isPredicate: false,
                        referent,
                        reveal: attribute.revealed,
                    });
                }
                else {
                    credentials.push(await credentialEntryFromAttribute(attribute));
                    credentialsProve.push({ entryIndex, isPredicate: false, referent, reveal: attribute.revealed });
                    entryIndex = entryIndex + 1;
                }
            }
            for (const referent in selectedCredentials.predicates) {
                const predicate = selectedCredentials.predicates[referent];
                // If the credentialId with the same timestamp is already present, we will use the existing entry, so that the proof is created
                // showing the attributes come from the same cred, rather than different ones.
                const existingCredentialIndex = credentials.findIndex((credential) => credential.credentialId === predicate.credentialId &&
                    predicate.timestamp === credential.credentialEntry.timestamp);
                if (existingCredentialIndex !== -1) {
                    credentialsProve.push({ entryIndex: existingCredentialIndex, isPredicate: true, referent, reveal: true });
                }
                else {
                    credentials.push(await credentialEntryFromAttribute(predicate));
                    credentialsProve.push({ entryIndex, isPredicate: true, referent, reveal: true });
                    entryIndex = entryIndex + 1;
                }
            }
            const linkSecretIds = credentials.map((item) => item.linkSecretId);
            const linkSecretId = (0, linkSecret_1.assertLinkSecretsMatch)(agentContext, linkSecretIds);
            const linkSecret = await (0, linkSecret_1.getLinkSecret)(agentContext, linkSecretId);
            presentation = anoncreds_shared_1.Presentation.create({
                credentialDefinitions: rsCredentialDefinitions,
                schemas: rsSchemas,
                presentationRequest: proofRequest,
                credentials: credentials.map((entry) => entry.credentialEntry),
                credentialsProve,
                selfAttest: selectedCredentials.selfAttestedAttributes,
                linkSecret,
            });
            return presentation.toJson();
        }
        finally {
            presentation === null || presentation === void 0 ? void 0 : presentation.handle.clear();
        }
    }
    async createCredentialRequest(agentContext, options) {
        const { useLegacyProverDid, credentialDefinition, credentialOffer } = options;
        let createReturnObj;
        try {
            const linkSecretRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsLinkSecretRepository);
            // If a link secret is specified, use it. Otherwise, attempt to use default link secret
            let linkSecretRecord = options.linkSecretId
                ? await linkSecretRepository.getByLinkSecretId(agentContext, options.linkSecretId)
                : await linkSecretRepository.findDefault(agentContext);
            // No default link secret. Automatically create one if set on module config
            if (!linkSecretRecord) {
                const moduleConfig = agentContext.dependencyManager.resolve(AnonCredsModuleConfig_1.AnonCredsModuleConfig);
                if (!moduleConfig.autoCreateLinkSecret) {
                    throw new error_1.AnonCredsRsError('No link secret provided to createCredentialRequest and no default link secret has been found');
                }
                const { linkSecretId, linkSecretValue } = await this.createLinkSecret(agentContext, {});
                linkSecretRecord = await (0, utils_1.storeLinkSecret)(agentContext, { linkSecretId, linkSecretValue, setAsDefault: true });
            }
            if (!linkSecretRecord.value) {
                throw new error_1.AnonCredsRsError('Link Secret value not stored');
            }
            const isLegacyIdentifier = credentialOffer.cred_def_id.match(utils_1.unqualifiedCredentialDefinitionIdRegex);
            if (!isLegacyIdentifier && useLegacyProverDid) {
                throw new core_1.CredoError('Cannot use legacy prover_did with non-legacy identifiers');
            }
            createReturnObj = anoncreds_shared_1.CredentialRequest.create({
                entropy: !useLegacyProverDid || !isLegacyIdentifier ? anoncreds_shared_1.anoncreds.generateNonce() : undefined,
                proverDid: useLegacyProverDid
                    ? core_1.TypedArrayEncoder.toBase58(core_1.TypedArrayEncoder.fromString(anoncreds_shared_1.anoncreds.generateNonce().slice(0, 16)))
                    : undefined,
                credentialDefinition: credentialDefinition,
                credentialOffer: credentialOffer,
                linkSecret: linkSecretRecord.value,
                linkSecretId: linkSecretRecord.linkSecretId,
            });
            return {
                credentialRequest: createReturnObj.credentialRequest.toJson(),
                credentialRequestMetadata: createReturnObj.credentialRequestMetadata.toJson(),
            };
        }
        finally {
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialRequest.handle.clear();
            createReturnObj === null || createReturnObj === void 0 ? void 0 : createReturnObj.credentialRequestMetadata.handle.clear();
        }
    }
    async w3cToLegacyCredential(agentContext, options) {
        const credentialJson = core_1.JsonTransformer.toJSON(options.credential);
        const w3cAnonCredsCredentialObj = anoncreds_shared_1.W3cCredential.fromJson(credentialJson);
        const w3cCredentialObj = w3cAnonCredsCredentialObj.toLegacy();
        const legacyCredential = w3cCredentialObj.toJson();
        return legacyCredential;
    }
    async processW3cCredential(agentContext, credential, processOptions) {
        const { credentialRequestMetadata, revocationRegistryDefinition, credentialDefinition } = processOptions;
        const processCredentialOptions = {
            credentialRequestMetadata: credentialRequestMetadata,
            linkSecret: await (0, linkSecret_1.getLinkSecret)(agentContext, credentialRequestMetadata.link_secret_name),
            revocationRegistryDefinition: revocationRegistryDefinition,
            credentialDefinition: credentialDefinition,
        };
        const credentialJson = core_1.JsonTransformer.toJSON(credential);
        const w3cAnonCredsCredential = anoncreds_shared_1.W3cCredential.fromJson(credentialJson);
        const processedW3cAnonCredsCredential = w3cAnonCredsCredential.process(processCredentialOptions);
        const processedW3cJsonLdVerifiableCredential = core_1.JsonTransformer.fromJSON(processedW3cAnonCredsCredential.toJson(), core_1.W3cJsonLdVerifiableCredential);
        return processedW3cJsonLdVerifiableCredential;
    }
    async legacyToW3cCredential(agentContext, options) {
        var _a, _b;
        const { credential, issuerId, processOptions } = options;
        let w3cCredential;
        let anonCredsCredential;
        let w3cCredentialObj;
        try {
            anonCredsCredential = anoncreds_shared_1.Credential.fromJson(credential);
            w3cCredentialObj = anonCredsCredential.toW3c({ issuerId, w3cVersion: '1.1' });
            const w3cJsonLdVerifiableCredential = core_1.JsonTransformer.fromJSON(w3cCredentialObj.toJson(), core_1.W3cJsonLdVerifiableCredential);
            w3cCredential = processOptions
                ? await this.processW3cCredential(agentContext, w3cJsonLdVerifiableCredential, processOptions)
                : w3cJsonLdVerifiableCredential;
        }
        finally {
            (_a = anonCredsCredential === null || anonCredsCredential === void 0 ? void 0 : anonCredsCredential.handle) === null || _a === void 0 ? void 0 : _a.clear();
            (_b = w3cCredentialObj === null || w3cCredentialObj === void 0 ? void 0 : w3cCredentialObj.handle) === null || _b === void 0 ? void 0 : _b.clear();
        }
        return w3cCredential;
    }
    async storeW3cCredential(agentContext, options) {
        const { credential, credentialRequestMetadata, schema, credentialDefinition, credentialDefinitionId, revocationRegistryId, } = options;
        const methodName = agentContext.dependencyManager
            .resolve(services_1.AnonCredsRegistryService)
            .getRegistryForIdentifier(agentContext, credential.issuerId).methodName;
        // this thows an error if the link secret is not found
        await (0, linkSecret_1.getLinkSecret)(agentContext, credentialRequestMetadata.link_secret_name);
        const { revocationRegistryIndex } = anoncreds_shared_1.W3cCredential.fromJson(core_1.JsonTransformer.toJSON(credential));
        if (Array.isArray(credential.credentialSubject)) {
            throw new core_1.CredoError('Credential subject must be an object, not an array.');
        }
        const anonCredsTags = (0, w3cAnonCredsUtils_1.getW3cRecordAnonCredsTags)({
            credentialSubject: credential.credentialSubject,
            issuerId: credential.issuerId,
            schema,
            schemaId: credentialDefinition.schemaId,
            credentialDefinitionId,
            revocationRegistryId,
            credentialRevocationId: revocationRegistryIndex === null || revocationRegistryIndex === void 0 ? void 0 : revocationRegistryIndex.toString(),
            linkSecretId: credentialRequestMetadata.link_secret_name,
            methodName,
        });
        const w3cCredentialService = agentContext.dependencyManager.resolve(core_1.W3cCredentialService);
        const w3cCredentialRecord = await w3cCredentialService.storeCredential(agentContext, { credential });
        const anonCredsCredentialMetadata = {
            credentialRevocationId: anonCredsTags.anonCredsCredentialRevocationId,
            linkSecretId: anonCredsTags.anonCredsLinkSecretId,
            methodName: anonCredsTags.anonCredsMethodName,
        };
        w3cCredentialRecord.setTags(anonCredsTags);
        w3cCredentialRecord.metadata.set(metadata_1.W3cAnonCredsCredentialMetadataKey, anonCredsCredentialMetadata);
        const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
        await w3cCredentialRepository.update(agentContext, w3cCredentialRecord);
        return w3cCredentialRecord;
    }
    async storeCredential(agentContext, options) {
        const { credential, credentialDefinition, credentialDefinitionId, credentialRequestMetadata, schema, revocationRegistry, } = options;
        const w3cJsonLdCredential = credential instanceof core_1.W3cJsonLdVerifiableCredential
            ? credential
            : await this.legacyToW3cCredential(agentContext, {
                credential,
                issuerId: credentialDefinition.issuerId,
                processOptions: {
                    credentialRequestMetadata,
                    credentialDefinition,
                    revocationRegistryDefinition: revocationRegistry === null || revocationRegistry === void 0 ? void 0 : revocationRegistry.definition,
                },
            });
        const w3cCredentialRecord = await this.storeW3cCredential(agentContext, {
            credentialRequestMetadata,
            credential: w3cJsonLdCredential,
            credentialDefinitionId,
            schema,
            credentialDefinition,
            revocationRegistryDefinition: revocationRegistry === null || revocationRegistry === void 0 ? void 0 : revocationRegistry.definition,
            revocationRegistryId: revocationRegistry === null || revocationRegistry === void 0 ? void 0 : revocationRegistry.id,
        });
        return w3cCredentialRecord.id;
    }
    async getCredential(agentContext, options) {
        const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
        const w3cCredentialRecord = await w3cCredentialRepository.findById(agentContext, options.id);
        if (w3cCredentialRecord) {
            return (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(w3cCredentialRecord, options.useUnqualifiedIdentifiersIfPresent);
        }
        const anonCredsCredentialRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsCredentialRepository);
        const anonCredsCredentialRecord = await anonCredsCredentialRepository.getByCredentialId(agentContext, options.id);
        agentContext.config.logger.warn([
            `Querying legacy credential repository for credential with id ${options.id}.`,
            `Please run the migration script to migrate credentials to the new w3c format.`,
        ].join('\n'));
        return (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(anonCredsCredentialRecord);
    }
    async getLegacyCredentials(agentContext, options) {
        const credentialRecords = await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialRepository)
            .findByQuery(agentContext, {
            credentialDefinitionId: options.credentialDefinitionId,
            schemaId: options.schemaId,
            issuerId: options.issuerId,
            schemaName: options.schemaName,
            schemaVersion: options.schemaVersion,
            schemaIssuerId: options.schemaIssuerId,
            methodName: options.methodName,
        });
        return credentialRecords.map((credentialRecord) => (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(credentialRecord));
    }
    async getCredentials(agentContext, options) {
        const credentialRecords = await agentContext.dependencyManager
            .resolve(core_1.W3cCredentialRepository)
            .findByQuery(agentContext, {
            issuerId: !options.issuerId || (0, indyIdentifiers_1.isUnqualifiedIndyDid)(options.issuerId) ? undefined : options.issuerId,
            anonCredsCredentialDefinitionId: !options.credentialDefinitionId || (0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(options.credentialDefinitionId)
                ? undefined
                : options.credentialDefinitionId,
            anonCredsSchemaId: !options.schemaId || (0, indyIdentifiers_1.isUnqualifiedSchemaId)(options.schemaId) ? undefined : options.schemaId,
            anonCredsSchemaName: options.schemaName,
            anonCredsSchemaVersion: options.schemaVersion,
            anonCredsSchemaIssuerId: !options.schemaIssuerId || (0, indyIdentifiers_1.isUnqualifiedIndyDid)(options.schemaIssuerId) ? undefined : options.schemaIssuerId,
            anonCredsMethodName: options.methodName,
            anonCredsUnqualifiedSchemaId: options.schemaId && (0, indyIdentifiers_1.isUnqualifiedSchemaId)(options.schemaId) ? options.schemaId : undefined,
            anonCredsUnqualifiedIssuerId: options.issuerId && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(options.issuerId) ? options.issuerId : undefined,
            anonCredsUnqualifiedSchemaIssuerId: options.schemaIssuerId && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(options.schemaIssuerId) ? options.schemaIssuerId : undefined,
            anonCredsUnqualifiedCredentialDefinitionId: options.credentialDefinitionId && (0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(options.credentialDefinitionId)
                ? options.credentialDefinitionId
                : undefined,
        });
        const credentials = credentialRecords.map((credentialRecord) => (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(credentialRecord));
        const legacyCredentials = await this.getLegacyCredentials(agentContext, options);
        if (legacyCredentials.length > 0) {
            agentContext.config.logger.warn(`Queried credentials include legacy credentials. Please run the migration script to migrate credentials to the new w3c format.`);
        }
        return [...legacyCredentials, ...credentials];
    }
    async deleteCredential(agentContext, id) {
        const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
        const w3cCredentialRecord = await w3cCredentialRepository.findById(agentContext, id);
        if (w3cCredentialRecord) {
            await w3cCredentialRepository.delete(agentContext, w3cCredentialRecord);
            return;
        }
        const anoncredsCredentialRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsCredentialRepository);
        const anoncredsCredentialRecord = await anoncredsCredentialRepository.getByCredentialId(agentContext, id);
        await anoncredsCredentialRepository.delete(agentContext, anoncredsCredentialRecord);
    }
    async getLegacyCredentialsForProofRequest(agentContext, options) {
        var _a, _b;
        const proofRequest = options.proofRequest;
        const referent = options.attributeReferent;
        const requestedAttribute = (_a = proofRequest.requested_attributes[referent]) !== null && _a !== void 0 ? _a : proofRequest.requested_predicates[referent];
        if (!requestedAttribute) {
            throw new error_1.AnonCredsRsError(`Referent not found in proof request`);
        }
        const $and = [];
        // Make sure the attribute(s) that are requested are present using the marker tag
        const attributes = (_b = requestedAttribute.names) !== null && _b !== void 0 ? _b : [requestedAttribute.name];
        const attributeQuery = {};
        for (const attribute of attributes) {
            attributeQuery[`anonCredsAttr::${attribute}::marker`] = true;
        }
        $and.push(attributeQuery);
        // Add query for proof request restrictions
        if (requestedAttribute.restrictions) {
            const restrictionQuery = this.queryLegacyFromRestrictions(requestedAttribute.restrictions);
            $and.push(restrictionQuery);
        }
        // Add extra query
        // TODO: we're not really typing the extraQuery, and it will work differently based on the anoncreds implmentation
        // We should make the allowed properties more strict
        if (options.extraQuery) {
            $and.push(options.extraQuery);
        }
        const credentials = await agentContext.dependencyManager
            .resolve(repository_1.AnonCredsCredentialRepository)
            .findByQuery(agentContext, {
            $and,
        });
        return credentials.map((credentialRecord) => {
            return {
                credentialInfo: (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(credentialRecord),
                interval: proofRequest.non_revoked,
            };
        });
    }
    async getCredentialsForProofRequest(agentContext, options) {
        var _a, _b;
        const proofRequest = options.proofRequest;
        const referent = options.attributeReferent;
        const requestedAttribute = (_a = proofRequest.requested_attributes[referent]) !== null && _a !== void 0 ? _a : proofRequest.requested_predicates[referent];
        if (!requestedAttribute) {
            throw new error_1.AnonCredsRsError(`Referent not found in proof request`);
        }
        const $and = [];
        const useUnqualifiedIdentifiers = (0, proofRequest_1.proofRequestUsesUnqualifiedIdentifiers)(proofRequest);
        // Make sure the attribute(s) that are requested are present using the marker tag
        const attributes = (_b = requestedAttribute.names) !== null && _b !== void 0 ? _b : [requestedAttribute.name];
        const attributeQuery = {};
        for (const attribute of attributes) {
            attributeQuery[`anonCredsAttr::${attribute}::marker`] = true;
        }
        $and.push(attributeQuery);
        // Add query for proof request restrictions
        if (requestedAttribute.restrictions) {
            const restrictionQuery = this.queryFromRestrictions(requestedAttribute.restrictions);
            $and.push(restrictionQuery);
        }
        // Add extra query
        // TODO: we're not really typing the extraQuery, and it will work differently based on the anoncreds implmentation
        // We should make the allowed properties more strict
        if (options.extraQuery) {
            $and.push(options.extraQuery);
        }
        const w3cCredentialRepository = agentContext.dependencyManager.resolve(core_1.W3cCredentialRepository);
        const credentials = await w3cCredentialRepository.findByQuery(agentContext, { $and });
        const legacyCredentialWithMetadata = await this.getLegacyCredentialsForProofRequest(agentContext, options);
        if (legacyCredentialWithMetadata.length > 0) {
            agentContext.config.logger.warn([
                `Including legacy credentials in proof request.`,
                `Please run the migration script to migrate credentials to the new w3c format.`,
            ].join('\n'));
        }
        const credentialWithMetadata = credentials.map((credentialRecord) => {
            return {
                credentialInfo: (0, w3cAnonCredsUtils_1.getAnoncredsCredentialInfoFromRecord)(credentialRecord, useUnqualifiedIdentifiers),
                interval: proofRequest.non_revoked,
            };
        });
        return [...credentialWithMetadata, ...legacyCredentialWithMetadata];
    }
    queryFromRestrictions(restrictions) {
        var _a, _b;
        const query = [];
        const { restrictions: parsedRestrictions } = core_1.JsonTransformer.fromJSON({ restrictions }, models_1.AnonCredsRestrictionWrapper);
        for (const restriction of parsedRestrictions) {
            const queryElements = {};
            if (restriction.credentialDefinitionId) {
                if ((0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(restriction.credentialDefinitionId)) {
                    queryElements.anonCredsUnqualifiedCredentialDefinitionId = restriction.credentialDefinitionId;
                }
                else {
                    queryElements.anonCredsCredentialDefinitionId = restriction.credentialDefinitionId;
                }
            }
            if (restriction.issuerId || restriction.issuerDid) {
                const issuerId = ((_a = restriction.issuerId) !== null && _a !== void 0 ? _a : restriction.issuerDid);
                if ((0, indyIdentifiers_1.isUnqualifiedIndyDid)(issuerId)) {
                    queryElements.anonCredsUnqualifiedIssuerId = issuerId;
                }
                else {
                    queryElements.issuerId = issuerId;
                }
            }
            if (restriction.schemaId) {
                if ((0, indyIdentifiers_1.isUnqualifiedSchemaId)(restriction.schemaId)) {
                    queryElements.anonCredsUnqualifiedSchemaId = restriction.schemaId;
                }
                else {
                    queryElements.anonCredsSchemaId = restriction.schemaId;
                }
            }
            if (restriction.schemaIssuerId || restriction.schemaIssuerDid) {
                const schemaIssuerId = ((_b = restriction.schemaIssuerId) !== null && _b !== void 0 ? _b : restriction.schemaIssuerDid);
                if ((0, indyIdentifiers_1.isUnqualifiedIndyDid)(schemaIssuerId)) {
                    queryElements.anonCredsUnqualifiedSchemaIssuerId = schemaIssuerId;
                }
                else {
                    queryElements.anonCredsSchemaIssuerId = schemaIssuerId;
                }
            }
            if (restriction.schemaName) {
                queryElements.anonCredsSchemaName = restriction.schemaName;
            }
            if (restriction.schemaVersion) {
                queryElements.anonCredsSchemaVersion = restriction.schemaVersion;
            }
            for (const [attributeName, attributeValue] of Object.entries(restriction.attributeValues)) {
                queryElements[`anonCredsAttr::${attributeName}::value`] = attributeValue;
            }
            for (const [attributeName, isAvailable] of Object.entries(restriction.attributeMarkers)) {
                if (isAvailable) {
                    queryElements[`anonCredsAttr::${attributeName}::marker`] = isAvailable;
                }
            }
            query.push(queryElements);
        }
        return query.length === 1 ? query[0] : { $or: query };
    }
    queryLegacyFromRestrictions(restrictions) {
        var _a, _b;
        const query = [];
        const { restrictions: parsedRestrictions } = core_1.JsonTransformer.fromJSON({ restrictions }, models_1.AnonCredsRestrictionWrapper);
        for (const restriction of parsedRestrictions) {
            const queryElements = {};
            const additionalQueryElements = {};
            if (restriction.credentialDefinitionId) {
                queryElements.credentialDefinitionId = restriction.credentialDefinitionId;
                if ((0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(restriction.credentialDefinitionId)) {
                    additionalQueryElements.credentialDefinitionId = restriction.credentialDefinitionId;
                }
            }
            if (restriction.issuerId || restriction.issuerDid) {
                const issuerId = ((_a = restriction.issuerId) !== null && _a !== void 0 ? _a : restriction.issuerDid);
                queryElements.issuerId = issuerId;
                if ((0, indyIdentifiers_1.isUnqualifiedIndyDid)(issuerId)) {
                    additionalQueryElements.issuerId = issuerId;
                }
            }
            if (restriction.schemaId) {
                queryElements.schemaId = restriction.schemaId;
                if ((0, indyIdentifiers_1.isUnqualifiedSchemaId)(restriction.schemaId)) {
                    additionalQueryElements.schemaId = restriction.schemaId;
                }
            }
            if (restriction.schemaIssuerId || restriction.schemaIssuerDid) {
                const issuerId = ((_b = restriction.schemaIssuerId) !== null && _b !== void 0 ? _b : restriction.schemaIssuerDid);
                queryElements.schemaIssuerId = issuerId;
                if ((0, indyIdentifiers_1.isUnqualifiedIndyDid)(issuerId)) {
                    additionalQueryElements.schemaIssuerId = issuerId;
                }
            }
            if (restriction.schemaName) {
                queryElements.schemaName = restriction.schemaName;
            }
            if (restriction.schemaVersion) {
                queryElements.schemaVersion = restriction.schemaVersion;
            }
            for (const [attributeName, attributeValue] of Object.entries(restriction.attributeValues)) {
                queryElements[`attr::${attributeName}::value`] = attributeValue;
            }
            for (const [attributeName, isAvailable] of Object.entries(restriction.attributeMarkers)) {
                if (isAvailable) {
                    queryElements[`attr::${attributeName}::marker`] = isAvailable;
                }
            }
            query.push(queryElements);
            if (Object.keys(additionalQueryElements).length > 0) {
                query.push(additionalQueryElements);
            }
        }
        return query.length === 1 ? query[0] : { $or: query };
    }
    async createW3cPresentation(agentContext, options) {
        const { credentialsProve, credentials } = await this.getPresentationMetadata(agentContext, {
            credentialsWithMetadata: options.credentialsWithRevocationMetadata,
            credentialsProve: options.credentialsProve,
        });
        let w3cAnonCredsPresentation;
        let w3cPresentation;
        try {
            w3cAnonCredsPresentation = anoncreds_shared_1.W3cPresentation.create({
                credentials,
                credentialsProve,
                schemas: options.schemas,
                credentialDefinitions: options.credentialDefinitions,
                presentationRequest: options.proofRequest,
                linkSecret: await (0, linkSecret_1.getLinkSecret)(agentContext, options.linkSecretId),
            });
            const presentationJson = w3cAnonCredsPresentation.toJson();
            w3cPresentation = core_1.JsonTransformer.fromJSON(presentationJson, core_1.W3cJsonLdVerifiablePresentation);
        }
        finally {
            w3cAnonCredsPresentation === null || w3cAnonCredsPresentation === void 0 ? void 0 : w3cAnonCredsPresentation.handle.clear();
        }
        return w3cPresentation;
    }
};
exports.AnonCredsRsHolderService = AnonCredsRsHolderService;
exports.AnonCredsRsHolderService = AnonCredsRsHolderService = __decorate([
    (0, core_1.injectable)()
], AnonCredsRsHolderService);
//# sourceMappingURL=AnonCredsRsHolderService.js.map