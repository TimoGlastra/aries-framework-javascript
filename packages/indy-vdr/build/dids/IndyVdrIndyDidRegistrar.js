"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrIndyDidRegistrar = void 0;
const anoncreds_1 = require("@credo-ts/anoncreds");
const core_1 = require("@credo-ts/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const error_1 = require("../error");
const IndyVdrPoolService_1 = require("../pool/IndyVdrPoolService");
const didIndyUtil_1 = require("./didIndyUtil");
const didSovUtil_1 = require("./didSovUtil");
class IndyVdrIndyDidRegistrar {
    constructor() {
        this.supportedMethods = ['indy'];
    }
    didCreateActionResult({ namespace, didAction, did, }) {
        return {
            jobId: did,
            didDocumentMetadata: {},
            didRegistrationMetadata: {
                didIndyNamespace: namespace,
            },
            didState: didAction,
        };
    }
    didCreateFailedResult({ reason }) {
        return {
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: reason,
            },
        };
    }
    didCreateFinishedResult({ seed, privateKey, did, didDocument, namespace, }) {
        return {
            didDocumentMetadata: {},
            didRegistrationMetadata: {
                didIndyNamespace: namespace,
            },
            didState: {
                state: 'finished',
                did,
                didDocument,
                secret: {
                    // FIXME: the uni-registrar creates the seed in the registrar method
                    // if it doesn't exist so the seed can always be returned. Currently
                    // we can only return it if the seed was passed in by the user. Once
                    // we have a secure method for generating seeds we should use the same
                    // approach
                    seed: seed,
                    privateKey: privateKey,
                },
            },
        };
    }
    async parseInput(agentContext, options) {
        var _a, _b;
        let did = options.did;
        let namespaceIdentifier;
        let verificationKey;
        const seed = (_a = options.secret) === null || _a === void 0 ? void 0 : _a.seed;
        const privateKey = (_b = options.secret) === null || _b === void 0 ? void 0 : _b.privateKey;
        if (options.options.endorsedTransaction) {
            const _did = did;
            const { namespace } = (0, anoncreds_1.parseIndyDid)(_did);
            // endorser did from the transaction
            const endorserNamespaceIdentifier = JSON.parse(options.options.endorsedTransaction.nymRequest).identifier;
            return {
                status: 'ok',
                did: _did,
                namespace: namespace,
                namespaceIdentifier: (0, anoncreds_1.parseIndyDid)(_did).namespaceIdentifier,
                endorserNamespaceIdentifier,
                seed,
                privateKey,
            };
        }
        const endorserDid = options.options.endorserDid;
        const { namespace: endorserNamespace, namespaceIdentifier: endorserNamespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(endorserDid);
        const allowOne = [privateKey, seed, did].filter((e) => e !== undefined);
        if (allowOne.length > 1) {
            return {
                status: 'error',
                reason: `Only one of 'seed', 'privateKey' and 'did' must be provided`,
            };
        }
        if (did) {
            if (!options.options.verkey) {
                return {
                    status: 'error',
                    reason: 'If a did is defined, a matching verkey must be provided',
                };
            }
            const { namespace: didNamespace, namespaceIdentifier: didNamespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(did);
            namespaceIdentifier = didNamespaceIdentifier;
            verificationKey = core_1.Key.fromPublicKeyBase58(options.options.verkey, core_1.KeyType.Ed25519);
            if (!(0, didIndyUtil_1.isSelfCertifiedIndyDid)(did, options.options.verkey)) {
                return {
                    status: 'error',
                    reason: `Initial verkey ${options.options.verkey} does not match did ${did}`,
                };
            }
            if (didNamespace !== endorserNamespace) {
                return {
                    status: 'error',
                    reason: `The endorser did uses namespace: '${endorserNamespace}' and the did to register uses namespace: '${didNamespace}'. Namespaces must match.`,
                };
            }
        }
        else {
            // Create a new key and calculate did according to the rules for indy did method
            verificationKey = await agentContext.wallet.createKey({ privateKey, seed, keyType: core_1.KeyType.Ed25519 });
            const buffer = core_1.Hasher.hash(verificationKey.publicKey, 'sha-256');
            namespaceIdentifier = core_1.TypedArrayEncoder.toBase58(buffer.slice(0, 16));
            did = `did:indy:${endorserNamespace}:${namespaceIdentifier}`;
        }
        return {
            status: 'ok',
            did,
            verificationKey,
            namespaceIdentifier,
            namespace: endorserNamespace,
            endorserNamespaceIdentifier,
            seed,
            privateKey,
        };
    }
    async saveDidRecord(agentContext, did, didDocument) {
        // Save the did so we know we created it and can issue with it
        const didRecord = new core_1.DidRecord({
            did,
            role: core_1.DidDocumentRole.Created,
            didDocument,
        });
        const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
        await didRepository.save(agentContext, didRecord);
    }
    createDidDocument(did, verificationKey, services, useEndpointAttrib) {
        // Create base did document
        const didDocumentBuilder = (0, didIndyUtil_1.indyDidDocumentFromDid)(did, verificationKey.publicKeyBase58);
        let diddocContent;
        // Add services if object was passed
        if (services) {
            services.forEach((item) => {
                const prependDidIfNotPresent = (id) => {
                    return id.startsWith('#') ? `${did}${id}` : id;
                };
                // Prepend the did to the service id if it is not already there
                item.id = prependDidIfNotPresent(item.id);
                // TODO: should we also prepend the did to routingKeys?
                if (item instanceof core_1.DidCommV1Service) {
                    item.recipientKeys = item.recipientKeys.map(prependDidIfNotPresent);
                }
                didDocumentBuilder.addService(item);
            });
            const commTypes = [core_1.IndyAgentService.type, core_1.DidCommV1Service.type, core_1.NewDidCommV2Service.type, core_1.DidCommV2Service.type];
            const serviceTypes = new Set(services.map((item) => item.type));
            const keyAgreementId = `${did}#key-agreement-1`;
            // If there is at least a communication service, add the key agreement key
            if (commTypes.some((type) => serviceTypes.has(type))) {
                didDocumentBuilder
                    .addContext('https://w3id.org/security/suites/x25519-2019/v1')
                    .addVerificationMethod({
                    controller: did,
                    id: keyAgreementId,
                    publicKeyBase58: (0, didIndyUtil_1.createKeyAgreementKey)(verificationKey.publicKeyBase58),
                    type: 'X25519KeyAgreementKey2019',
                })
                    .addKeyAgreement(keyAgreementId);
            }
            // FIXME: it doesn't seem this context exists?
            // If there is a DIDComm V2 service, add context
            if (serviceTypes.has(core_1.NewDidCommV2Service.type) || serviceTypes.has(core_1.DidCommV2Service.type)) {
                didDocumentBuilder.addContext('https://didcomm.org/messaging/contexts/v2');
            }
            if (!useEndpointAttrib) {
                // create diddocContent parameter based on the diff between the base and the resulting DID Document
                diddocContent = (0, didIndyUtil_1.didDocDiff)(didDocumentBuilder.build().toJSON(), (0, didIndyUtil_1.indyDidDocumentFromDid)(did, verificationKey.publicKeyBase58).build().toJSON());
            }
        }
        // Build did document
        const didDocument = didDocumentBuilder.build();
        return {
            diddocContent,
            didDocument,
        };
    }
    async create(agentContext, options) {
        try {
            const res = await this.parseInput(agentContext, options);
            if (res.status === 'error')
                return this.didCreateFailedResult({ reason: res.reason });
            const { did, namespaceIdentifier, endorserNamespaceIdentifier, verificationKey, namespace, seed, privateKey } = res;
            const pool = agentContext.dependencyManager.resolve(IndyVdrPoolService_1.IndyVdrPoolService).getPoolForNamespace(namespace);
            let nymRequest;
            let didDocument;
            let attribRequest;
            let alias;
            if (options.options.endorsedTransaction) {
                const { nymRequest: _nymRequest, attribRequest: _attribRequest } = options.options.endorsedTransaction;
                nymRequest = new indy_vdr_shared_1.CustomRequest({ customRequest: _nymRequest });
                attribRequest = _attribRequest ? new indy_vdr_shared_1.CustomRequest({ customRequest: _attribRequest }) : undefined;
            }
            else {
                const { services, useEndpointAttrib } = options.options;
                alias = options.options.alias;
                if (!verificationKey)
                    throw new Error('VerificationKey not defined');
                const { didDocument: _didDocument, diddocContent } = this.createDidDocument(did, verificationKey, services, useEndpointAttrib);
                didDocument = _didDocument;
                let didRegisterSigningKey = undefined;
                if (options.options.endorserMode === 'internal')
                    didRegisterSigningKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, options.options.endorserDid);
                nymRequest = await this.createRegisterDidWriteRequest({
                    agentContext,
                    pool,
                    signingKey: didRegisterSigningKey,
                    submitterNamespaceIdentifier: endorserNamespaceIdentifier,
                    namespaceIdentifier,
                    verificationKey,
                    alias,
                    diddocContent,
                    role: options.options.role,
                });
                if (services && useEndpointAttrib) {
                    const endpoints = (0, didSovUtil_1.endpointsAttribFromServices)(services);
                    attribRequest = await this.createSetDidEndpointsRequest({
                        agentContext,
                        pool,
                        signingKey: verificationKey,
                        endorserDid: options.options.endorserMode === 'external' ? options.options.endorserDid : undefined,
                        unqualifiedDid: namespaceIdentifier,
                        endpoints,
                    });
                }
                if (options.options.endorserMode === 'external') {
                    const didAction = {
                        state: 'action',
                        action: 'endorseIndyTransaction',
                        endorserDid: options.options.endorserDid,
                        nymRequest: nymRequest.body,
                        attribRequest: attribRequest === null || attribRequest === void 0 ? void 0 : attribRequest.body,
                        did: did,
                        secret: { seed, privateKey },
                    };
                    return this.didCreateActionResult({ namespace, didAction, did });
                }
            }
            await this.registerPublicDid(agentContext, pool, nymRequest);
            if (attribRequest)
                await this.setEndpointsForDid(agentContext, pool, attribRequest);
            didDocument = didDocument !== null && didDocument !== void 0 ? didDocument : (await (0, didIndyUtil_1.buildDidDocument)(agentContext, pool, did));
            await this.saveDidRecord(agentContext, did, didDocument);
            return this.didCreateFinishedResult({ did, didDocument, namespace, seed, privateKey });
        }
        catch (error) {
            return this.didCreateFailedResult({ reason: `unknownError: ${error.message}` });
        }
    }
    async update() {
        return {
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: `notImplemented: updating did:indy not implemented yet`,
            },
        };
    }
    async deactivate() {
        return {
            didDocumentMetadata: {},
            didRegistrationMetadata: {},
            didState: {
                state: 'failed',
                reason: `notImplemented: deactivating did:indy not implemented yet`,
            },
        };
    }
    async createRegisterDidWriteRequest(options) {
        const { agentContext, pool, submitterNamespaceIdentifier, namespaceIdentifier, verificationKey, alias, signingKey, role, } = options;
        // FIXME: Add diddocContent when supported by indy-vdr
        if (options.diddocContent) {
            throw new error_1.IndyVdrError('diddocContent is not yet supported');
        }
        const request = new indy_vdr_shared_1.NymRequest({
            submitterDid: submitterNamespaceIdentifier,
            dest: namespaceIdentifier,
            verkey: verificationKey.publicKeyBase58,
            alias,
            role,
        });
        if (!signingKey)
            return request;
        const writeRequest = await pool.prepareWriteRequest(agentContext, request, signingKey, undefined);
        return writeRequest;
    }
    async registerPublicDid(agentContext, pool, writeRequest) {
        const body = writeRequest.body;
        try {
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Register public did on ledger '${pool.indyNamespace}'\nRequest: ${body}}`, {
                response,
            });
            return;
        }
        catch (error) {
            agentContext.config.logger.error(`Error Registering public did on ledger '${pool.indyNamespace}'\nRequest: ${body}}`);
            throw error;
        }
    }
    async createSetDidEndpointsRequest(options) {
        const { agentContext, pool, endpoints, unqualifiedDid, signingKey, endorserDid } = options;
        const request = new indy_vdr_shared_1.AttribRequest({
            submitterDid: unqualifiedDid,
            targetDid: unqualifiedDid,
            raw: JSON.stringify({ endpoint: endpoints }),
        });
        const writeRequest = await pool.prepareWriteRequest(agentContext, request, signingKey, endorserDid);
        return writeRequest;
    }
    async setEndpointsForDid(agentContext, pool, writeRequest) {
        const body = writeRequest.body;
        try {
            const response = await pool.submitRequest(writeRequest);
            agentContext.config.logger.debug(`Successfully set endpoints for did on ledger '${pool.indyNamespace}'.\nRequest: ${body}}`, {
                response,
            });
        }
        catch (error) {
            agentContext.config.logger.error(`Error setting endpoints for did on ledger '${pool.indyNamespace}'.\nRequest: ${body}}`);
            throw new error_1.IndyVdrError(error);
        }
    }
}
exports.IndyVdrIndyDidRegistrar = IndyVdrIndyDidRegistrar;
//# sourceMappingURL=IndyVdrIndyDidRegistrar.js.map