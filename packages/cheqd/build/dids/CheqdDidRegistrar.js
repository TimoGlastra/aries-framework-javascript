"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheqdDidRegistrar = void 0;
const sdk_1 = require("@cheqd/sdk");
const v2_1 = require("@cheqd/ts-proto/cheqd/resource/v2");
const core_1 = require("@credo-ts/core");
const identifiers_1 = require("../anoncreds/utils/identifiers");
const ledger_1 = require("../ledger");
const didCheqdUtil_1 = require("./didCheqdUtil");
class CheqdDidRegistrar {
    constructor() {
        this.supportedMethods = ['cheqd'];
    }
    async create(agentContext, options) {
        var _a, _b, _c;
        const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
        const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
        let didDocument;
        const versionId = (_b = (_a = options.options) === null || _a === void 0 ? void 0 : _a.versionId) !== null && _b !== void 0 ? _b : core_1.utils.uuid();
        try {
            if (options.didDocument && (0, didCheqdUtil_1.validateSpecCompliantPayload)(options.didDocument)) {
                didDocument = options.didDocument;
                const cheqdDid = (0, identifiers_1.parseCheqdDid)(options.didDocument.id);
                if (!cheqdDid) {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: `Unable to parse cheqd did ${options.didDocument.id}`,
                        },
                    };
                }
            }
            else if ((_c = options.secret) === null || _c === void 0 ? void 0 : _c.verificationMethod) {
                const withoutDidDocumentOptions = options;
                const verificationMethod = withoutDidDocumentOptions.secret.verificationMethod;
                const methodSpecificIdAlgo = withoutDidDocumentOptions.options.methodSpecificIdAlgo;
                const privateKey = verificationMethod.privateKey;
                if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, core_1.KeyType.Ed25519)) {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: 'Invalid private key provided',
                        },
                    };
                }
                const key = await agentContext.wallet.createKey({
                    keyType: core_1.KeyType.Ed25519,
                    privateKey: privateKey,
                });
                didDocument = (0, didCheqdUtil_1.generateDidDoc)({
                    verificationMethod: verificationMethod.type,
                    verificationMethodId: verificationMethod.id || 'key-1',
                    methodSpecificIdAlgo: methodSpecificIdAlgo || sdk_1.MethodSpecificIdAlgo.Uuid,
                    network: withoutDidDocumentOptions.options.network,
                    publicKey: core_1.TypedArrayEncoder.toHex(key.publicKey),
                });
                const contextMapping = {
                    Ed25519VerificationKey2018: 'https://w3id.org/security/suites/ed25519-2018/v1',
                    Ed25519VerificationKey2020: 'https://w3id.org/security/suites/ed25519-2020/v1',
                    JsonWebKey2020: 'https://w3id.org/security/suites/jws-2020/v1',
                };
                const contextUrl = contextMapping[verificationMethod.type];
                // Add the context to the did document
                // NOTE: cheqd sdk uses https://www.w3.org/ns/did/v1 while Credo did doc uses https://w3id.org/did/v1
                // We should align these at some point. For now we just return a consistent value.
                didDocument.context = ['https://www.w3.org/ns/did/v1', contextUrl];
            }
            else {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: 'Provide a didDocument or at least one verificationMethod with seed in secret',
                    },
                };
            }
            const didDocumentJson = didDocument.toJSON();
            const payloadToSign = await (0, didCheqdUtil_1.createMsgCreateDidDocPayloadToSign)(didDocumentJson, versionId);
            const signInputs = await this.signPayload(agentContext, payloadToSign, didDocument.verificationMethod);
            const response = await cheqdLedgerService.create(didDocumentJson, signInputs, versionId);
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            // Save the did so we know we created it and can issue with it
            const didRecord = new core_1.DidRecord({
                did: didDocument.id,
                role: core_1.DidDocumentRole.Created,
                didDocument,
            });
            await didRepository.save(agentContext, didRecord);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'finished',
                    did: didDocument.id,
                    didDocument,
                    secret: options.secret,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error registering DID`, error);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async update(agentContext, options) {
        var _a, _b, _c;
        const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
        const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
        const versionId = ((_a = options.options) === null || _a === void 0 ? void 0 : _a.versionId) || core_1.utils.uuid();
        const verificationMethod = (_b = options.secret) === null || _b === void 0 ? void 0 : _b.verificationMethod;
        let didDocument;
        let didRecord;
        try {
            if (options.didDocument && (0, didCheqdUtil_1.validateSpecCompliantPayload)(options.didDocument)) {
                didDocument = options.didDocument;
                const resolvedDocument = await cheqdLedgerService.resolve(didDocument.id);
                didRecord = await didRepository.findCreatedDid(agentContext, didDocument.id);
                if (!resolvedDocument.didDocument || resolvedDocument.didDocumentMetadata.deactivated || !didRecord) {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: 'Did not found',
                        },
                    };
                }
                if (verificationMethod) {
                    const privateKey = verificationMethod.privateKey;
                    if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, core_1.KeyType.Ed25519)) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: 'Invalid private key provided',
                            },
                        };
                    }
                    const key = await agentContext.wallet.createKey({
                        keyType: core_1.KeyType.Ed25519,
                        privateKey: privateKey,
                    });
                    (_c = didDocument.verificationMethod) === null || _c === void 0 ? void 0 : _c.concat(core_1.JsonTransformer.fromJSON((0, sdk_1.createDidVerificationMethod)([verificationMethod.type], [
                        {
                            methodSpecificId: didDocument.id.split(':')[3],
                            didUrl: didDocument.id,
                            keyId: `${didDocument.id}#${verificationMethod.id}`,
                            publicKey: core_1.TypedArrayEncoder.toHex(key.publicKey),
                        },
                    ]), core_1.VerificationMethod));
                }
            }
            else {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: 'Provide a valid didDocument',
                    },
                };
            }
            const payloadToSign = await (0, didCheqdUtil_1.createMsgCreateDidDocPayloadToSign)(didDocument, versionId);
            const signInputs = await this.signPayload(agentContext, payloadToSign, didDocument.verificationMethod);
            const response = await cheqdLedgerService.update(didDocument, signInputs, versionId);
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            // Save the did so we know we created it and can issue with it
            didRecord.didDocument = didDocument;
            await didRepository.update(agentContext, didRecord);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'finished',
                    did: didDocument.id,
                    didDocument,
                    secret: options.secret,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error updating DID`, error);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async deactivate(agentContext, options) {
        var _a;
        const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
        const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
        const did = options.did;
        const versionId = ((_a = options.options) === null || _a === void 0 ? void 0 : _a.versionId) || core_1.utils.uuid();
        try {
            const { didDocument, didDocumentMetadata } = await cheqdLedgerService.resolve(did);
            const didRecord = await didRepository.findCreatedDid(agentContext, did);
            if (!didDocument || didDocumentMetadata.deactivated || !didRecord) {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: 'Did not found',
                    },
                };
            }
            const payloadToSign = (0, didCheqdUtil_1.createMsgDeactivateDidDocPayloadToSign)(didDocument, versionId);
            const didDocumentInstance = core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument);
            const signInputs = await this.signPayload(agentContext, payloadToSign, didDocumentInstance.verificationMethod);
            const response = await cheqdLedgerService.deactivate(didDocument, signInputs, versionId);
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            await didRepository.update(agentContext, didRecord);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'finished',
                    did: didDocument.id,
                    didDocument: core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument),
                    secret: options.secret,
                },
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error deactivating DID`, error);
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async createResource(agentContext, did, resource) {
        const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
        const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
        const { didDocument, didDocumentMetadata } = await cheqdLedgerService.resolve(did);
        const didRecord = await didRepository.findCreatedDid(agentContext, did);
        if (!didDocument || didDocumentMetadata.deactivated || !didRecord) {
            return {
                resourceMetadata: {},
                resourceRegistrationMetadata: {},
                resourceState: {
                    state: 'failed',
                    reason: `DID: ${did} not found`,
                },
            };
        }
        try {
            let data;
            if (typeof resource.data === 'string') {
                data = core_1.TypedArrayEncoder.fromBase64(resource.data);
            }
            else if (typeof resource.data == 'object') {
                data = core_1.TypedArrayEncoder.fromString(JSON.stringify(resource.data));
            }
            else {
                data = resource.data;
            }
            const resourcePayload = v2_1.MsgCreateResourcePayload.fromPartial({
                collectionId: did.split(':')[3],
                id: resource.id,
                resourceType: resource.resourceType,
                name: resource.name,
                version: resource.version,
                alsoKnownAs: resource.alsoKnownAs,
                data,
            });
            const payloadToSign = v2_1.MsgCreateResourcePayload.encode(resourcePayload).finish();
            const didDocumentInstance = core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument);
            const signInputs = await this.signPayload(agentContext, payloadToSign, didDocumentInstance.verificationMethod);
            const response = await cheqdLedgerService.createResource(did, resourcePayload, signInputs);
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            return {
                resourceMetadata: {},
                resourceRegistrationMetadata: {},
                resourceState: {
                    state: 'finished',
                    resourceId: resourcePayload.id,
                    resource: resourcePayload,
                },
            };
        }
        catch (error) {
            return {
                resourceMetadata: {},
                resourceRegistrationMetadata: {},
                resourceState: {
                    state: 'failed',
                    reason: `unknownError: ${error.message}`,
                },
            };
        }
    }
    async signPayload(agentContext, payload, verificationMethod = []) {
        return await Promise.all(verificationMethod.map(async (method) => {
            const key = (0, core_1.getKeyFromVerificationMethod)(method);
            return {
                verificationMethodId: method.id,
                signature: await agentContext.wallet.sign({ data: core_1.Buffer.from(payload), key }),
            };
        }));
    }
}
exports.CheqdDidRegistrar = CheqdDidRegistrar;
//# sourceMappingURL=CheqdDidRegistrar.js.map