"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrAnonCredsRegistry = void 0;
const anoncreds_1 = require("@credo-ts/anoncreds");
const core_1 = require("@credo-ts/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const didIndyUtil_1 = require("../dids/didIndyUtil");
const pool_1 = require("../pool");
const sign_1 = require("../utils/sign");
const identifiers_1 = require("./utils/identifiers");
const transform_1 = require("./utils/transform");
class IndyVdrAnonCredsRegistry {
    constructor() {
        this.methodName = 'indy';
        this.supportedIdentifier = identifiers_1.indyVdrAnonCredsRegistryIdentifierRegex;
    }
    async getSchema(agentContext, schemaId) {
        try {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            // parse schema id (supports did:indy and legacy)
            const { did, namespaceIdentifier, schemaName, schemaVersion } = (0, anoncreds_1.parseIndySchemaId)(schemaId);
            const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
            agentContext.config.logger.debug(`Getting schema '${schemaId}' from ledger '${pool.indyNamespace}'`);
            // even though we support did:indy and legacy identifiers we always need to fetch using the legacy identifier
            const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
            const request = new indy_vdr_shared_1.GetSchemaRequest({ schemaId: legacySchemaId });
            agentContext.config.logger.trace(`Submitting get schema request for schema '${schemaId}' to ledger '${pool.indyNamespace}'`);
            const response = await pool.submitRequest(request);
            agentContext.config.logger.trace(`Got un-parsed schema '${schemaId}' from ledger '${pool.indyNamespace}'`, {
                response,
            });
            if (!('attr_names' in response.result.data)) {
                agentContext.config.logger.error(`Error retrieving schema '${schemaId}'`);
                return {
                    schemaId,
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to find schema with id ${schemaId}`,
                    },
                    schemaMetadata: {},
                };
            }
            return {
                schema: {
                    attrNames: response.result.data.attr_names,
                    name: response.result.data.name,
                    version: response.result.data.version,
                    issuerId: did,
                },
                schemaId,
                resolutionMetadata: {},
                schemaMetadata: {
                    didIndyNamespace: pool.indyNamespace,
                    // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                    // For this reason we return it in the metadata.
                    indyLedgerSeqNo: response.result.seqNo,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error retrieving schema '${schemaId}'`, {
                error,
                schemaId,
            });
            return {
                schemaId,
                resolutionMetadata: {
                    error: 'notFound',
                },
                schemaMetadata: {},
            };
        }
    }
    async registerSchema(agentContext, options) {
        var _a, _b;
        const schema = options.schema;
        const { issuerId, name, version, attrNames } = schema;
        try {
            // This will throw an error if trying to register a schema with a legacy indy identifier. We only support did:indy identifiers
            // for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
            const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(issuerId);
            const { endorserDid, endorserMode } = options.options;
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const pool = indyVdrPoolService.getPoolForNamespace(namespace);
            let writeRequest;
            const didIndySchemaId = (0, identifiers_1.getDidIndySchemaId)(namespace, namespaceIdentifier, schema.name, schema.version);
            const endorsedTransaction = options.options.endorsedTransaction;
            if (endorsedTransaction) {
                agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${issuerId}'`, schema);
                writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
            }
            else {
                agentContext.config.logger.debug(`Create schema tx on ledger '${namespace}' with did '${issuerId}'`, schema);
                const legacySchemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(namespaceIdentifier, name, version);
                const schemaRequest = new indy_vdr_shared_1.SchemaRequest({
                    submitterDid: namespaceIdentifier,
                    schema: { id: legacySchemaId, name, ver: '1.0', version, attrNames },
                });
                const submitterKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, issuerId);
                writeRequest = await pool.prepareWriteRequest(agentContext, schemaRequest, submitterKey, endorserDid !== issuerId ? endorserDid : undefined);
                if (endorserMode === 'external') {
                    return {
                        jobId: didIndySchemaId,
                        schemaState: {
                            state: 'action',
                            action: 'endorseIndyTransaction',
                            schemaId: didIndySchemaId,
                            schema: schema,
                            schemaRequest: writeRequest.body,
                        },
                        registrationMetadata: {},
                        schemaMetadata: {},
                    };
                }
                if (endorserMode === 'internal' && endorserDid !== issuerId) {
                    const endorserKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                    await (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                }
            }
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Registered schema '${didIndySchemaId}' on ledger '${pool.indyNamespace}'`, {
                response,
                writeRequest,
            });
            return {
                schemaState: {
                    state: 'finished',
                    schema: schema,
                    schemaId: didIndySchemaId,
                },
                registrationMetadata: {},
                schemaMetadata: {
                    // NOTE: the seqNo is required by the indy-sdk even though not present in AnonCreds v1.
                    // For this reason we return it in the metadata.
                    // Cast to SchemaResponse to pass type check
                    indyLedgerSeqNo: (_b = (_a = response === null || response === void 0 ? void 0 : response.result) === null || _a === void 0 ? void 0 : _a.txnMetadata) === null || _b === void 0 ? void 0 : _b.seqNo,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error registering schema for did '${issuerId}'`, {
                error,
                did: issuerId,
                schema: schema,
            });
            return {
                schemaMetadata: {},
                registrationMetadata: {},
                schemaState: {
                    state: 'failed',
                    schema: schema,
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async getCredentialDefinition(agentContext, credentialDefinitionId) {
        try {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            // we support did:indy and legacy identifiers
            const { did, namespaceIdentifier, schemaSeqNo, tag } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(credentialDefinitionId);
            const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
            agentContext.config.logger.debug(`Getting credential definition '${credentialDefinitionId}' from ledger '${pool.indyNamespace}'`);
            const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, tag);
            const request = new indy_vdr_shared_1.GetCredentialDefinitionRequest({
                credentialDefinitionId: legacyCredentialDefinitionId,
            });
            agentContext.config.logger.trace(`Submitting get credential definition request for credential definition '${credentialDefinitionId}' to ledger '${pool.indyNamespace}'`);
            const response = await pool.submitRequest(request);
            // We need to fetch the schema to determine the schemaId (we only have the seqNo)
            const schema = await this.fetchIndySchemaWithSeqNo(agentContext, response.result.ref, namespaceIdentifier);
            if (!schema || !response.result.data) {
                agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`);
                return {
                    credentialDefinitionId,
                    credentialDefinitionMetadata: {},
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `unable to resolve credential definition with id ${credentialDefinitionId}`,
                    },
                };
            }
            // Format the schema id based on the type of the credential definition id
            const schemaId = credentialDefinitionId.startsWith('did:indy')
                ? (0, identifiers_1.getDidIndySchemaId)(pool.indyNamespace, schema.schema.issuerId, schema.schema.name, schema.schema.version)
                : schema.schema.schemaId;
            return {
                credentialDefinitionId,
                credentialDefinition: {
                    issuerId: did,
                    schemaId,
                    tag: response.result.tag,
                    type: 'CL',
                    value: response.result.data,
                },
                credentialDefinitionMetadata: {
                    didIndyNamespace: pool.indyNamespace,
                },
                resolutionMetadata: {},
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error retrieving credential definition '${credentialDefinitionId}'`, {
                error,
                credentialDefinitionId,
            });
            return {
                credentialDefinitionId,
                credentialDefinitionMetadata: {},
                resolutionMetadata: {
                    error: 'notFound',
                    message: `unable to resolve credential definition: ${error.message}`,
                },
            };
        }
    }
    async registerCredentialDefinition(agentContext, options) {
        var _a;
        const credentialDefinition = options.credentialDefinition;
        const { schemaId, issuerId, tag, value } = credentialDefinition;
        try {
            // This will throw an error if trying to register a credential definition with a legacy indy identifier. We only support did:indy
            // identifiers for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
            const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(issuerId);
            const { endorserDid, endorserMode } = options.options;
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const pool = indyVdrPoolService.getPoolForNamespace(namespace);
            agentContext.config.logger.debug(`Registering credential definition on ledger '${namespace}' with did '${issuerId}'`, options.credentialDefinition);
            let writeRequest;
            let didIndyCredentialDefinitionId;
            let schemaSeqNo;
            const endorsedTransaction = options.options.endorsedTransaction;
            if (endorsedTransaction) {
                agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${issuerId}'`, credentialDefinition);
                writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
                const operation = (_a = JSON.parse(endorsedTransaction)) === null || _a === void 0 ? void 0 : _a.operation;
                // extract the seqNo from the endorsed transaction, which is contained in the ref field of the operation
                schemaSeqNo = Number(operation === null || operation === void 0 ? void 0 : operation.ref);
                didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, schemaSeqNo, tag);
            }
            else {
                // TODO: this will bypass caching if done on a higher level.
                const { schemaMetadata, resolutionMetadata } = await this.getSchema(agentContext, schemaId);
                if (!(schemaMetadata === null || schemaMetadata === void 0 ? void 0 : schemaMetadata.indyLedgerSeqNo) || typeof schemaMetadata.indyLedgerSeqNo !== 'number') {
                    return {
                        registrationMetadata: {},
                        credentialDefinitionMetadata: {
                            didIndyNamespace: pool.indyNamespace,
                        },
                        credentialDefinitionState: {
                            credentialDefinition: options.credentialDefinition,
                            state: 'failed',
                            reason: `error resolving schema with id ${schemaId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                        },
                    };
                }
                schemaSeqNo = schemaMetadata.indyLedgerSeqNo;
                // FIXME: we need to check if schemaId has same namespace as issuerId and it should not be a legacy identifier
                // FIXME: in the other methods we also need to add checks. E.g. when creating a revocation
                // status list, you can only create a revocation status list for a credential definition registry that is created
                // under the same namespace and by the same issuer id (you can create a cred def for a schema created by another issuer
                // but you can't create a revocation registry based on a cred def created by another issuer. We need to add these checks
                // to all register methods in this file)
                const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(issuerId, schemaSeqNo, tag);
                didIndyCredentialDefinitionId = (0, identifiers_1.getDidIndyCredentialDefinitionId)(namespace, namespaceIdentifier, schemaSeqNo, tag);
                const credentialDefinitionRequest = new indy_vdr_shared_1.CredentialDefinitionRequest({
                    submitterDid: namespaceIdentifier,
                    credentialDefinition: {
                        ver: '1.0',
                        id: legacyCredentialDefinitionId,
                        schemaId: schemaSeqNo.toString(),
                        type: 'CL',
                        tag,
                        value,
                    },
                });
                const submitterKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, issuerId);
                writeRequest = await pool.prepareWriteRequest(agentContext, credentialDefinitionRequest, submitterKey, endorserDid !== issuerId ? endorserDid : undefined);
                if (endorserMode === 'external') {
                    return {
                        jobId: didIndyCredentialDefinitionId,
                        credentialDefinitionState: {
                            state: 'action',
                            action: 'endorseIndyTransaction',
                            credentialDefinition: credentialDefinition,
                            credentialDefinitionId: didIndyCredentialDefinitionId,
                            credentialDefinitionRequest: writeRequest.body,
                        },
                        registrationMetadata: {},
                        credentialDefinitionMetadata: {},
                    };
                }
                if (endorserMode === 'internal' && endorserDid !== issuerId) {
                    const endorserKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                    await (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                }
            }
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Registered credential definition '${didIndyCredentialDefinitionId}' on ledger '${pool.indyNamespace}'`, {
                response,
                credentialDefinition: options.credentialDefinition,
            });
            return {
                credentialDefinitionMetadata: {},
                credentialDefinitionState: {
                    credentialDefinition: credentialDefinition,
                    credentialDefinitionId: didIndyCredentialDefinitionId,
                    state: 'finished',
                },
                registrationMetadata: {},
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error registering credential definition for schema '${schemaId}'`, {
                error,
                did: issuerId,
                credentialDefinition: options.credentialDefinition,
            });
            return {
                credentialDefinitionMetadata: {},
                registrationMetadata: {},
                credentialDefinitionState: {
                    credentialDefinition: options.credentialDefinition,
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId) {
        try {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const { did, namespaceIdentifier, credentialDefinitionTag, revocationRegistryTag, schemaSeqNo } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryDefinitionId);
            const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
            agentContext.config.logger.debug(`Using ledger '${pool.indyNamespace}' to retrieve revocation registry definition '${revocationRegistryDefinitionId}'`);
            const legacyRevocationRegistryId = (0, anoncreds_1.getUnqualifiedRevocationRegistryDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
            const request = new indy_vdr_shared_1.GetRevocationRegistryDefinitionRequest({
                revocationRegistryId: legacyRevocationRegistryId,
            });
            agentContext.config.logger.trace(`Submitting get revocation registry definition request for revocation registry definition '${revocationRegistryDefinitionId}' to ledger`);
            const response = await pool.submitRequest(request);
            if (!response.result.data) {
                agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                    revocationRegistryDefinitionId,
                });
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: 'unable to resolve revocation registry definition',
                    },
                    revocationRegistryDefinitionId,
                    revocationRegistryDefinitionMetadata: {},
                };
            }
            agentContext.config.logger.trace(`Got revocation registry definition '${revocationRegistryDefinitionId}' from ledger '${pool.indyNamespace}'`, {
                response,
            });
            const credentialDefinitionId = revocationRegistryDefinitionId.startsWith('did:indy:')
                ? (0, identifiers_1.getDidIndyCredentialDefinitionId)(pool.indyNamespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag)
                : (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag);
            const revocationRegistryDefinition = {
                issuerId: did,
                revocDefType: response.result.data.revocDefType,
                value: {
                    maxCredNum: response.result.data.value.maxCredNum,
                    tailsHash: response.result.data.value.tailsHash,
                    tailsLocation: response.result.data.value.tailsLocation,
                    publicKeys: {
                        accumKey: {
                            z: response.result.data.value.publicKeys.accumKey.z,
                        },
                    },
                },
                tag: response.result.data.tag,
                credDefId: credentialDefinitionId,
            };
            return {
                revocationRegistryDefinitionId,
                revocationRegistryDefinition,
                revocationRegistryDefinitionMetadata: {
                    issuanceType: response.result.data.value.issuanceType,
                    didIndyNamespace: pool.indyNamespace,
                },
                resolutionMetadata: {},
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error retrieving revocation registry definition '${revocationRegistryDefinitionId}' from ledger`, {
                error,
                revocationRegistryDefinitionId,
            });
            return {
                resolutionMetadata: {
                    error: 'notFound',
                    message: `unable to resolve revocation registry definition: ${error.message}`,
                },
                revocationRegistryDefinitionId,
                revocationRegistryDefinitionMetadata: {},
            };
        }
    }
    async registerRevocationRegistryDefinition(agentContext, { options, revocationRegistryDefinition }) {
        try {
            // This will throw an error if trying to register a credential definition with a legacy indy identifier. We only support did:indy
            // identifiers for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
            const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(revocationRegistryDefinition.issuerId);
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const pool = indyVdrPoolService.getPoolForNamespace(namespace);
            agentContext.config.logger.debug(`Registering revocation registry definition on ledger '${namespace}' with did '${revocationRegistryDefinition.issuerId}'`, revocationRegistryDefinition);
            let writeRequest;
            let didIndyRevocationRegistryDefinitionId;
            const { schemaSeqNo, tag: credentialDefinitionTag } = (0, anoncreds_1.parseIndyCredentialDefinitionId)(revocationRegistryDefinition.credDefId);
            const { endorsedTransaction, endorserDid, endorserMode } = options;
            if (endorsedTransaction) {
                agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${revocationRegistryDefinition.issuerId}'`, revocationRegistryDefinition);
                writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
                didIndyRevocationRegistryDefinitionId = (0, identifiers_1.getDidIndyRevocationRegistryDefinitionId)(namespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryDefinition.tag);
            }
            else {
                const legacyRevocationRegistryDefinitionId = (0, anoncreds_1.getUnqualifiedRevocationRegistryDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryDefinition.tag);
                didIndyRevocationRegistryDefinitionId = (0, identifiers_1.getDidIndyRevocationRegistryDefinitionId)(namespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryDefinition.tag);
                const legacyCredentialDefinitionId = (0, anoncreds_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag);
                const revocationRegistryDefinitionRequest = new indy_vdr_shared_1.RevocationRegistryDefinitionRequest({
                    submitterDid: namespaceIdentifier,
                    revocationRegistryDefinitionV1: {
                        id: legacyRevocationRegistryDefinitionId,
                        ver: '1.0',
                        credDefId: legacyCredentialDefinitionId,
                        tag: revocationRegistryDefinition.tag,
                        revocDefType: revocationRegistryDefinition.revocDefType,
                        value: Object.assign({ issuanceType: 'ISSUANCE_BY_DEFAULT' }, revocationRegistryDefinition.value),
                    },
                });
                const submitterKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, revocationRegistryDefinition.issuerId);
                writeRequest = await pool.prepareWriteRequest(agentContext, revocationRegistryDefinitionRequest, submitterKey, endorserDid !== revocationRegistryDefinition.issuerId ? endorserDid : undefined);
                if (endorserMode === 'external') {
                    return {
                        jobId: didIndyRevocationRegistryDefinitionId,
                        revocationRegistryDefinitionState: {
                            state: 'action',
                            action: 'endorseIndyTransaction',
                            revocationRegistryDefinition,
                            revocationRegistryDefinitionId: didIndyRevocationRegistryDefinitionId,
                            revocationRegistryDefinitionRequest: writeRequest.body,
                        },
                        registrationMetadata: {},
                        revocationRegistryDefinitionMetadata: {},
                    };
                }
                if (endorserMode === 'internal' && endorserDid !== revocationRegistryDefinition.issuerId) {
                    const endorserKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                    await (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                }
            }
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Registered revocation registry definition '${didIndyRevocationRegistryDefinitionId}' on ledger '${pool.indyNamespace}'`, {
                response,
                revocationRegistryDefinition,
            });
            return {
                revocationRegistryDefinitionMetadata: {},
                revocationRegistryDefinitionState: {
                    revocationRegistryDefinition,
                    revocationRegistryDefinitionId: didIndyRevocationRegistryDefinitionId,
                    state: 'finished',
                },
                registrationMetadata: {},
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error registering revocation registry definition for credential definition '${revocationRegistryDefinition.credDefId}'`, {
                error,
                did: revocationRegistryDefinition.issuerId,
                revocationRegistryDefinition,
            });
            return {
                revocationRegistryDefinitionMetadata: {},
                registrationMetadata: {},
                revocationRegistryDefinitionState: {
                    revocationRegistryDefinition,
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async getRevocationStatusList(agentContext, revocationRegistryDefinitionId, timestamp) {
        try {
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const { did } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryDefinitionId);
            const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
            const revocationDelta = await this.fetchIndyRevocationDelta(agentContext, revocationRegistryDefinitionId, timestamp);
            if (!revocationDelta) {
                return {
                    resolutionMetadata: {
                        error: 'notFound',
                        message: `Error retrieving revocation registry delta '${revocationRegistryDefinitionId}' from ledger, potentially revocation interval ends before revocation registry creation`,
                    },
                    revocationStatusListMetadata: {},
                };
            }
            const { revocationRegistryDefinition, resolutionMetadata, revocationRegistryDefinitionMetadata } = await this.getRevocationRegistryDefinition(agentContext, revocationRegistryDefinitionId);
            if (!revocationRegistryDefinition ||
                !revocationRegistryDefinitionMetadata.issuanceType ||
                typeof revocationRegistryDefinitionMetadata.issuanceType !== 'string') {
                return {
                    resolutionMetadata: {
                        error: `error resolving revocation registry definition with id ${revocationRegistryDefinitionId}: ${resolutionMetadata.error} ${resolutionMetadata.message}`,
                    },
                    revocationStatusListMetadata: {
                        didIndyNamespace: pool.indyNamespace,
                    },
                };
            }
            const isIssuanceByDefault = revocationRegistryDefinitionMetadata.issuanceType === 'ISSUANCE_BY_DEFAULT';
            return {
                resolutionMetadata: {},
                revocationStatusList: (0, transform_1.anonCredsRevocationStatusListFromIndyVdr)(revocationRegistryDefinitionId, revocationRegistryDefinition, revocationDelta, isIssuanceByDefault),
                revocationStatusListMetadata: {
                    didIndyNamespace: pool.indyNamespace,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error retrieving revocation registry delta '${revocationRegistryDefinitionId}' from ledger, potentially revocation interval ends before revocation registry creation?"`, {
                error,
                revocationRegistryId: revocationRegistryDefinitionId,
            });
            return {
                resolutionMetadata: {
                    error: 'notFound',
                    message: `Error retrieving revocation registry delta '${revocationRegistryDefinitionId}' from ledger, potentially revocation interval ends before revocation registry creation: ${error.message}`,
                },
                revocationStatusListMetadata: {},
            };
        }
    }
    async registerRevocationStatusList(agentContext, { options, revocationStatusList }) {
        try {
            // This will throw an error if trying to register a revocation status list with a legacy indy identifier. We only support did:indy
            // identifiers for registering, that will allow us to extract the namespace and means all stored records will use did:indy identifiers.
            const { endorsedTransaction, endorserDid, endorserMode } = options;
            const { namespaceIdentifier, namespace } = (0, anoncreds_1.parseIndyDid)(revocationStatusList.issuerId);
            const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
            const pool = indyVdrPoolService.getPoolForNamespace(namespace);
            agentContext.config.logger.debug(`Registering revocation status list on ledger '${namespace}' with did '${revocationStatusList.issuerId}'`, revocationStatusList);
            let writeRequest;
            // Parse the revocation registry id
            const { schemaSeqNo, credentialDefinitionTag, namespaceIdentifier: revocationRegistryNamespaceIdentifier, revocationRegistryTag, namespace: revocationRegistryNamespace, } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationStatusList.revRegDefId);
            const legacyRevocationRegistryDefinitionId = (0, anoncreds_1.getUnqualifiedRevocationRegistryDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
            const didIndyRevocationRegistryEntryId = (0, identifiers_1.getDidIndyRevocationRegistryEntryId)(namespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
            if (revocationRegistryNamespace && revocationRegistryNamespace !== namespace) {
                throw new core_1.CredoError(`Issued id '${revocationStatusList.issuerId}' does not have the same namespace (${namespace}) as the revocation registry definition '${revocationRegistryNamespace}'`);
            }
            if (revocationRegistryNamespaceIdentifier !== namespaceIdentifier) {
                throw new core_1.CredoError(`Cannot register revocation registry definition using a different DID. Revocation registry definition contains '${revocationRegistryNamespaceIdentifier}', but DID used was '${namespaceIdentifier}'`);
            }
            if (endorsedTransaction) {
                agentContext.config.logger.debug(`Preparing endorsed tx '${endorsedTransaction}' for submission on ledger '${namespace}' with did '${revocationStatusList.issuerId}'`, revocationStatusList);
                writeRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedTransaction });
            }
            else {
                const previousDelta = await this.fetchIndyRevocationDelta(agentContext, legacyRevocationRegistryDefinitionId, 
                // Fetch revocation delta for current timestamp
                (0, anoncreds_1.dateToTimestamp)(new Date()));
                const revocationRegistryDefinitionEntryValue = (0, transform_1.indyVdrCreateLatestRevocationDelta)(revocationStatusList.currentAccumulator, revocationStatusList.revocationList, previousDelta !== null && previousDelta !== void 0 ? previousDelta : undefined);
                const revocationRegistryDefinitionRequest = new indy_vdr_shared_1.RevocationRegistryEntryRequest({
                    submitterDid: namespaceIdentifier,
                    revocationRegistryEntry: {
                        ver: '1.0',
                        value: revocationRegistryDefinitionEntryValue,
                    },
                    revocationRegistryDefinitionType: 'CL_ACCUM',
                    revocationRegistryDefinitionId: legacyRevocationRegistryDefinitionId,
                });
                const submitterKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, revocationStatusList.issuerId);
                writeRequest = await pool.prepareWriteRequest(agentContext, revocationRegistryDefinitionRequest, submitterKey, endorserDid !== revocationStatusList.issuerId ? endorserDid : undefined);
                if (endorserMode === 'external') {
                    return {
                        jobId: didIndyRevocationRegistryEntryId,
                        revocationStatusListState: {
                            state: 'action',
                            action: 'endorseIndyTransaction',
                            revocationStatusList,
                            revocationStatusListRequest: writeRequest.body,
                        },
                        registrationMetadata: {},
                        revocationStatusListMetadata: {},
                    };
                }
                if (endorserMode === 'internal' && endorserDid !== revocationStatusList.issuerId) {
                    const endorserKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, endorserDid);
                    await (0, sign_1.multiSignRequest)(agentContext, writeRequest, endorserKey, (0, anoncreds_1.parseIndyDid)(endorserDid).namespaceIdentifier);
                }
            }
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Registered revocation status list '${didIndyRevocationRegistryEntryId}' on ledger '${pool.indyNamespace}'`, {
                response,
                revocationStatusList,
            });
            return {
                revocationStatusListMetadata: {},
                revocationStatusListState: {
                    revocationStatusList: Object.assign(Object.assign({}, revocationStatusList), { timestamp: response.result.txnMetadata.txnTime }),
                    state: 'finished',
                },
                registrationMetadata: {},
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error registering revocation status list for revocation registry definition '${revocationStatusList.revRegDefId}}'`, {
                error,
                did: revocationStatusList.issuerId,
            });
            return {
                registrationMetadata: {},
                revocationStatusListMetadata: {},
                revocationStatusListState: {
                    revocationStatusList,
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async fetchIndySchemaWithSeqNo(agentContext, seqNo, did) {
        var _a, _b, _c;
        const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
        const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
        agentContext.config.logger.debug(`Getting transaction with seqNo '${seqNo}' from ledger '${pool.indyNamespace}'`);
        // ledgerType 1 is domain ledger
        const request = new indy_vdr_shared_1.GetTransactionRequest({ ledgerType: 1, seqNo });
        agentContext.config.logger.trace(`Submitting get transaction request to ledger '${pool.indyNamespace}'`);
        const response = await pool.submitRequest(request);
        if (((_a = response.result.data) === null || _a === void 0 ? void 0 : _a.txn.type) !== '101') {
            agentContext.config.logger.error(`Could not get schema from ledger for seq no ${seqNo}'`);
            return null;
        }
        const schema = (_b = response.result.data) === null || _b === void 0 ? void 0 : _b.txn.data;
        const schemaDid = (_c = response.result.data) === null || _c === void 0 ? void 0 : _c.txn.metadata.from;
        const schemaId = (0, anoncreds_1.getUnqualifiedSchemaId)(schemaDid, schema.data.name, schema.data.version);
        return {
            schema: {
                schemaId,
                attr_name: schema.data.attr_names,
                name: schema.data.name,
                version: schema.data.version,
                issuerId: schemaDid,
                seqNo,
            },
            indyNamespace: pool.indyNamespace,
        };
    }
    async fetchIndyRevocationDelta(agentContext, revocationRegistryDefinitionId, toTs) {
        const indyVdrPoolService = agentContext.dependencyManager.resolve(pool_1.IndyVdrPoolService);
        const { did, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag } = (0, anoncreds_1.parseIndyRevocationRegistryId)(revocationRegistryDefinitionId);
        const { pool } = await indyVdrPoolService.getPoolForDid(agentContext, did);
        agentContext.config.logger.debug(`Using ledger '${pool.indyNamespace}' to retrieve revocation registry deltas with revocation registry definition id '${revocationRegistryDefinitionId}' until ${toTs}`);
        const legacyRevocationRegistryDefinitionId = (0, anoncreds_1.getUnqualifiedRevocationRegistryDefinitionId)(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
        const deltaRequest = new indy_vdr_shared_1.GetRevocationRegistryDeltaRequest({
            toTs,
            submitterDid: namespaceIdentifier,
            revocationRegistryId: legacyRevocationRegistryDefinitionId,
        });
        agentContext.config.logger.trace(`Submitting get transaction request to ledger '${pool.indyNamespace}'`);
        const response = await pool.submitRequest(deltaRequest);
        const { result: { data, type, txnTime }, } = response;
        // Indicating there are no deltas
        if (type !== '117' || data === null || !txnTime) {
            agentContext.config.logger.warn(`Could not get any deltas from ledger for revocation registry definition '${revocationRegistryDefinitionId}' from ledger '${pool.indyNamespace}'`);
            return null;
        }
        return {
            revoked: data.value.revoked,
            issued: data.value.issued,
            accum: data.value.accum_to.value.accum,
            txnTime,
        };
    }
}
exports.IndyVdrAnonCredsRegistry = IndyVdrAnonCredsRegistry;
//# sourceMappingURL=IndyVdrAnonCredsRegistry.js.map