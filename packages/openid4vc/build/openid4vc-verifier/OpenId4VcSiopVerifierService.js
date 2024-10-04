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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcSiopVerifierService = void 0;
const core_1 = require("@credo-ts/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const OpenID4VP_1 = require("@sphereon/did-auth-siop/dist/authorization-response/OpenID4VP");
const rxjs_1 = require("rxjs");
const router_1 = require("../shared/router");
const transform_1 = require("../shared/transform");
const utils_1 = require("../shared/utils");
const OpenId4VcVerificationSessionState_1 = require("./OpenId4VcVerificationSessionState");
const OpenId4VcVerifierModuleConfig_1 = require("./OpenId4VcVerifierModuleConfig");
const repository_1 = require("./repository");
const OpenId4VcRelyingPartyEventEmitter_1 = require("./repository/OpenId4VcRelyingPartyEventEmitter");
const OpenId4VcRelyingPartySessionManager_1 = require("./repository/OpenId4VcRelyingPartySessionManager");
/**
 * @internal
 */
let OpenId4VcSiopVerifierService = class OpenId4VcSiopVerifierService {
    constructor(logger, w3cCredentialService, openId4VcVerifierRepository, config, openId4VcVerificationSessionRepository) {
        this.logger = logger;
        this.w3cCredentialService = w3cCredentialService;
        this.openId4VcVerifierRepository = openId4VcVerifierRepository;
        this.config = config;
        this.openId4VcVerificationSessionRepository = openId4VcVerificationSessionRepository;
    }
    async createAuthorizationRequest(agentContext, options) {
        var _a;
        const nonce = await agentContext.wallet.generateNonce();
        const state = await agentContext.wallet.generateNonce();
        // Correlation id will be the id of the verification session record
        const correlationId = core_1.utils.uuid();
        let authorizationResponseUrl = (0, core_1.joinUriParts)(this.config.baseUrl, [
            options.verifier.verifierId,
            this.config.authorizationEndpoint.endpointPath,
        ]);
        const jwtIssuer = options.requestSigner.method === 'x5c'
            ? await (0, utils_1.openIdTokenIssuerToJwtIssuer)(agentContext, Object.assign(Object.assign({}, options.requestSigner), { issuer: authorizationResponseUrl }))
            : await (0, utils_1.openIdTokenIssuerToJwtIssuer)(agentContext, options.requestSigner);
        let clientIdScheme;
        let clientId;
        if (jwtIssuer.method === 'x5c') {
            if (jwtIssuer.issuer !== authorizationResponseUrl) {
                throw new core_1.CredoError(`The jwtIssuer's issuer field must match the verifier's authorizationResponseUrl '${authorizationResponseUrl}'.`);
            }
            const leafCertificate = core_1.X509Service.getLeafCertificate(agentContext, { certificateChain: jwtIssuer.x5c });
            if (leafCertificate.sanDnsNames.includes((0, core_1.getDomainFromUrl)(jwtIssuer.issuer))) {
                clientIdScheme = 'x509_san_dns';
                clientId = (0, core_1.getDomainFromUrl)(jwtIssuer.issuer);
                authorizationResponseUrl = jwtIssuer.issuer;
            }
            else if (leafCertificate.sanUriNames.includes(jwtIssuer.issuer)) {
                clientIdScheme = 'x509_san_uri';
                clientId = jwtIssuer.issuer;
                authorizationResponseUrl = clientId;
            }
            else {
                throw new core_1.CredoError(`With jwtIssuer 'method' 'x5c' the jwtIssuer's 'issuer' field must either match the match a sanDnsName (FQDN) or sanUriName in the leaf x509 chain's leaf certificate.`);
            }
        }
        else if (jwtIssuer.method === 'did') {
            clientId = jwtIssuer.didUrl.split('#')[0];
            clientIdScheme = 'did';
        }
        else {
            throw new core_1.CredoError(`Unsupported jwt issuer method '${options.requestSigner.method}'. Only 'did' and 'x5c' are supported.`);
        }
        const relyingParty = await this.getRelyingParty(agentContext, options.verifier.verifierId, {
            presentationDefinition: (_a = options.presentationExchange) === null || _a === void 0 ? void 0 : _a.definition,
            authorizationResponseUrl,
            clientId,
            clientIdScheme,
            responseMode: options.responseMode,
        });
        // We always use shortened URIs currently
        const hostedAuthorizationRequestUri = (0, core_1.joinUriParts)(this.config.baseUrl, [
            options.verifier.verifierId,
            this.config.authorizationRequestEndpoint.endpointPath,
            // It doesn't really matter what the url is, as long as it's unique
            core_1.utils.uuid(),
        ]);
        // This is very unfortunate, but storing state in sphereon's SiOP-OID4VP library
        // is done async, so we can't be certain yet that the verification session record
        // is created already when we have created the authorization request. So we need to
        // wait for a short while before we can be certain that the verification session record
        // is created. To not use arbitrary timeouts, we wait for the specific RecordSavedEvent
        // that is emitted when the verification session record is created.
        const eventEmitter = agentContext.dependencyManager.resolve(core_1.EventEmitter);
        const verificationSessionCreatedPromise = (0, rxjs_1.firstValueFrom)(eventEmitter
            .observable(core_1.RepositoryEventTypes.RecordSaved)
            .pipe((0, rxjs_1.filter)((e) => e.metadata.contextCorrelationId === agentContext.contextCorrelationId), (0, rxjs_1.filter)((e) => e.payload.record.id === correlationId && e.payload.record.verifierId === options.verifier.verifierId), (0, rxjs_1.first)(), (0, rxjs_1.timeout)({
            first: 10000,
            meta: 'OpenId4VcSiopVerifierService.createAuthorizationRequest',
        }), (0, rxjs_1.map)((e) => e.payload.record)));
        const authorizationRequest = await relyingParty.createAuthorizationRequest({
            correlationId,
            nonce,
            state,
            requestByReferenceURI: hostedAuthorizationRequestUri,
            jwtIssuer,
            additionalPayloadClaims: options.additionalPayloadClaims
        });
        // NOTE: it's not possible to set the uri scheme when using the RP to create an auth request, only lower level
        // functions allow this. So we need to replace the uri scheme manually.
        let authorizationRequestUri = (await authorizationRequest.uri()).encodedUri;
        if (options.presentationExchange && !options.idToken) {
            authorizationRequestUri = authorizationRequestUri.replace('openid://', 'openid4vp://');
        }
        const verificationSession = await verificationSessionCreatedPromise;
        return {
            authorizationRequest: authorizationRequestUri,
            verificationSession,
        };
    }
    async verifyAuthorizationResponse(agentContext, options) {
        var _a;
        // Assert state
        options.verificationSession.assertState([
            OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved,
            OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated,
        ]);
        const authorizationRequest = await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(options.verificationSession.authorizationRequestJwt);
        const requestClientId = await authorizationRequest.getMergedProperty('client_id');
        const requestNonce = await authorizationRequest.getMergedProperty('nonce');
        const requestState = await authorizationRequest.getMergedProperty('state');
        const presentationDefinitionsWithLocation = await authorizationRequest.getPresentationDefinitions();
        if (!requestNonce || !requestClientId || !requestState) {
            throw new core_1.CredoError(`Unable to find nonce, state, or client_id in authorization request for verification session '${options.verificationSession.id}'`);
        }
        const authorizationResponseUrl = (0, core_1.joinUriParts)(this.config.baseUrl, [
            options.verificationSession.verifierId,
            this.config.authorizationEndpoint.endpointPath,
        ]);
        const relyingParty = await this.getRelyingParty(agentContext, options.verificationSession.verifierId, {
            presentationDefinition: (_a = presentationDefinitionsWithLocation === null || presentationDefinitionsWithLocation === void 0 ? void 0 : presentationDefinitionsWithLocation[0]) === null || _a === void 0 ? void 0 : _a.definition,
            clientId: requestClientId,
            authorizationResponseUrl,
        });
        // This is very unfortunate, but storing state in sphereon's SiOP-OID4VP library
        // is done async, so we can't be certain yet that the verification session record
        // is updated already when we have verified the authorization response. So we need to
        // wait for a short while before we can be certain that the verification session record
        // is updated. To not use arbitrary timeouts, we wait for the specific RecordUpdatedEvent
        // that is emitted when the verification session record is updated.
        const eventEmitter = agentContext.dependencyManager.resolve(core_1.EventEmitter);
        const verificationSessionUpdatedPromise = (0, rxjs_1.firstValueFrom)(eventEmitter
            .observable(core_1.RepositoryEventTypes.RecordUpdated)
            .pipe((0, rxjs_1.filter)((e) => e.metadata.contextCorrelationId === agentContext.contextCorrelationId), (0, rxjs_1.filter)((e) => e.payload.record.id === options.verificationSession.id &&
            e.payload.record.verifierId === options.verificationSession.verifierId &&
            (e.payload.record.state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified ||
                e.payload.record.state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error)), (0, rxjs_1.first)(), (0, rxjs_1.timeout)({
            first: 10000,
            meta: 'OpenId4VcSiopVerifierService.verifyAuthorizationResponse',
        }), (0, rxjs_1.map)((e) => e.payload.record)));
        await relyingParty.verifyAuthorizationResponse(options.authorizationResponse, {
            audience: requestClientId,
            correlationId: options.verificationSession.id,
            state: requestState,
            presentationDefinitions: presentationDefinitionsWithLocation,
            verification: {
                presentationVerificationCallback: this.getPresentationVerificationCallback(agentContext, {
                    nonce: requestNonce,
                    audience: requestClientId,
                    verifyHs256Callback: options.verifyHs256Callback
                }),
            },
        });
        const verificationSession = await verificationSessionUpdatedPromise;
        const verifiedAuthorizationResponse = await this.getVerifiedAuthorizationResponse(verificationSession);
        return Object.assign(Object.assign({}, verifiedAuthorizationResponse), { verificationSession: await verificationSessionUpdatedPromise });
    }
    // TODO: we can also choose to store this in the verification session, however we can easily derive it
    // so it's probably easier to make changes in the future if we just store the raw payload.
    async getVerifiedAuthorizationResponse(verificationSession) {
        var _a, _b, _c, _d;
        verificationSession.assertState(OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified);
        if (!verificationSession.authorizationResponsePayload) {
            throw new core_1.CredoError('No authorization response payload found in the verification session.');
        }
        const authorizationResponse = await did_auth_siop_1.AuthorizationResponse.fromPayload(verificationSession.authorizationResponsePayload);
        const authorizationRequest = await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(verificationSession.authorizationRequestJwt);
        const idToken = authorizationResponse.idToken
            ? { payload: await ((_a = authorizationResponse.idToken) === null || _a === void 0 ? void 0 : _a.payload()) }
            : undefined;
        let presentationExchange = undefined;
        const presentationDefinitions = await authorizationRequest.getPresentationDefinitions();
        if (presentationDefinitions && presentationDefinitions.length > 0) {
            const presentations = await (0, OpenID4VP_1.extractPresentationsFromAuthorizationResponse)(authorizationResponse, {
                hasher: core_1.Hasher.hash,
            });
            // TODO: Probably wise to check against request for the location of the submission_data
            const submission = (_d = (_c = (_b = idToken === null || idToken === void 0 ? void 0 : idToken.payload) === null || _b === void 0 ? void 0 : _b._vp_token) === null || _c === void 0 ? void 0 : _c.presentation_submission) !== null && _d !== void 0 ? _d : authorizationResponse.payload.presentation_submission;
            if (!submission) {
                throw new core_1.CredoError('Unable to extract submission from the response.');
            }
            const vps = Array.isArray(presentations) ? presentations : [presentations];
            presentationExchange = {
                definition: presentationDefinitions[0].definition,
                presentations: vps.map(transform_1.getVerifiablePresentationFromSphereonWrapped),
                submission,
            };
        }
        if (!idToken && !presentationExchange) {
            throw new core_1.CredoError('No idToken or presentationExchange found in the response.');
        }
        return {
            idToken,
            presentationExchange,
        };
    }
    /**
     * Find the verification session associated with an authorization response. You can optionally provide a verifier id
     * if the verifier that the response is associated with is already known.
     */
    async findVerificationSessionForAuthorizationResponse(agentContext, { authorizationResponse, authorizationResponseParams, verifierId, }) {
        let nonce;
        let state;
        if (authorizationResponse) {
            const authorizationResponseInstance = await did_auth_siop_1.AuthorizationResponse.fromPayload(authorizationResponse).catch(() => {
                throw new core_1.CredoError(`Unable to parse authorization response payload. ${JSON.stringify(authorizationResponse)}`);
            });
            nonce = await authorizationResponseInstance.getMergedProperty('nonce', {
                hasher: core_1.Hasher.hash,
            });
            state = await authorizationResponseInstance.getMergedProperty('state', {
                hasher: core_1.Hasher.hash,
            });
        }
        else {
            nonce = authorizationResponseParams.nonce;
            state = authorizationResponse;
        }
        const verificationSession = await this.openId4VcVerificationSessionRepository.findSingleByQuery(agentContext, {
            nonce,
            payloadState: state,
            verifierId,
        });
        return verificationSession;
    }
    async getAllVerifiers(agentContext) {
        return this.openId4VcVerifierRepository.getAll(agentContext);
    }
    async getVerifierByVerifierId(agentContext, verifierId) {
        return this.openId4VcVerifierRepository.getByVerifierId(agentContext, verifierId);
    }
    async updateVerifier(agentContext, verifier) {
        return this.openId4VcVerifierRepository.update(agentContext, verifier);
    }
    async createVerifier(agentContext, options) {
        var _a;
        const openId4VcVerifier = new repository_1.OpenId4VcVerifierRecord({
            verifierId: (_a = options === null || options === void 0 ? void 0 : options.verifierId) !== null && _a !== void 0 ? _a : core_1.utils.uuid(),
        });
        await this.openId4VcVerifierRepository.save(agentContext, openId4VcVerifier);
        await (0, router_1.storeActorIdForContextCorrelationId)(agentContext, openId4VcVerifier.verifierId);
        return openId4VcVerifier;
    }
    async findVerificationSessionsByQuery(agentContext, query, queryOptions) {
        return this.openId4VcVerificationSessionRepository.findByQuery(agentContext, query, queryOptions);
    }
    async getVerificationSessionById(agentContext, verificationSessionId) {
        return this.openId4VcVerificationSessionRepository.getById(agentContext, verificationSessionId);
    }
    async getRelyingParty(agentContext, verifierId, { idToken, presentationDefinition, clientId, clientIdScheme, authorizationResponseUrl, responseMode, }) {
        const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
        const supportedAlgs = (0, utils_1.getSupportedJwaSignatureAlgorithms)(agentContext);
        const supportedProofTypes = signatureSuiteRegistry.supportedProofTypes;
        // Check: audience must be set to the issuer with dynamic disc otherwise self-issued.me/v2.
        const builder = did_auth_siop_1.RP.builder();
        const responseTypes = [];
        if (!presentationDefinition && idToken === false) {
            throw new core_1.CredoError('Either `presentationExchange` or `idToken` must be enabled');
        }
        if (presentationDefinition) {
            responseTypes.push(did_auth_siop_1.ResponseType.VP_TOKEN);
        }
        if (idToken === true || !presentationDefinition) {
            responseTypes.push(did_auth_siop_1.ResponseType.ID_TOKEN);
        }
        // FIXME: we now manually remove did:peer, we should probably allow the user to configure this
        const supportedDidMethods = agentContext.dependencyManager
            .resolve(core_1.DidsApi)
            .supportedResolverMethods.filter((m) => m !== 'peer');
        // The OpenId4VcRelyingPartyEventHandler is a global event handler that makes sure that
        // all the events are handled, and that the correct context is used for the events.
        const sphereonEventEmitter = agentContext.dependencyManager
            .resolve(OpenId4VcRelyingPartyEventEmitter_1.OpenId4VcRelyingPartyEventHandler)
            .getEventEmitterForVerifier(agentContext.contextCorrelationId, verifierId);
        const mode = !responseMode || responseMode === 'direct_post'
            ? did_auth_siop_1.ResponseMode.DIRECT_POST
            : did_auth_siop_1.ResponseMode.DIRECT_POST_JWT;
        let jarmEncryptionJwk;
        if (mode === did_auth_siop_1.ResponseMode.DIRECT_POST_JWT) {
            const key = await agentContext.wallet.createKey({ keyType: core_1.KeyType.P256 });
            jarmEncryptionJwk = Object.assign(Object.assign({}, (0, core_1.getJwkFromKey)(key).toJson()), { kid: key.fingerprint, use: 'enc' });
        }
        const jarmClientMetadata = jarmEncryptionJwk
            ? {
                jwks: { keys: [jarmEncryptionJwk] },
                authorization_encrypted_response_alg: 'ECDH-ES',
                authorization_encrypted_response_enc: 'A256GCM',
            }
            : undefined;
        builder
            .withResponseUri(authorizationResponseUrl)
            .withIssuer(did_auth_siop_1.ResponseIss.SELF_ISSUED_V2)
            .withAudience(did_auth_siop_1.RequestAud.SELF_ISSUED_V2)
            .withIssuer(did_auth_siop_1.ResponseIss.SELF_ISSUED_V2)
            .withSupportedVersions([
            did_auth_siop_1.SupportedVersion.SIOPv2_D11,
            did_auth_siop_1.SupportedVersion.SIOPv2_D12_OID4VP_D18,
            did_auth_siop_1.SupportedVersion.SIOPv2_D12_OID4VP_D20,
        ])
            .withResponseMode(mode)
            .withHasher(core_1.Hasher.hash)
            // FIXME: should allow verification of revocation
            // .withRevocationVerificationCallback()
            .withRevocationVerification(did_auth_siop_1.RevocationVerification.NEVER)
            .withSessionManager(new OpenId4VcRelyingPartySessionManager_1.OpenId4VcRelyingPartySessionManager(agentContext, verifierId))
            .withEventEmitter(sphereonEventEmitter)
            .withResponseType(responseTypes)
            .withCreateJwtCallback((0, utils_1.getCreateJwtCallback)(agentContext))
            .withVerifyJwtCallback((0, utils_1.getVerifyJwtCallback)(agentContext))
            // TODO: we should probably allow some dynamic values here
            .withClientMetadata(Object.assign(Object.assign({ client_id: clientId }, jarmClientMetadata), { client_id_scheme: clientIdScheme, passBy: did_auth_siop_1.PassBy.VALUE, responseTypesSupported: [did_auth_siop_1.ResponseType.VP_TOKEN], subject_syntax_types_supported: supportedDidMethods.map((m) => `did:${m}`), vpFormatsSupported: {
                jwt_vc: {
                    alg: supportedAlgs,
                },
                jwt_vc_json: {
                    alg: supportedAlgs,
                },
                jwt_vp: {
                    alg: supportedAlgs,
                },
                ldp_vc: {
                    proof_type: supportedProofTypes,
                },
                ldp_vp: {
                    proof_type: supportedProofTypes,
                },
                'vc+sd-jwt': {
                    kb_jwt_alg_values: supportedAlgs,
                    sd_jwt_alg_values: supportedAlgs,
                },
            } }));
        if (clientIdScheme) {
            builder.withClientIdScheme(clientIdScheme);
        }
        if (presentationDefinition) {
            builder.withPresentationDefinition({ definition: presentationDefinition }, [did_auth_siop_1.PropertyTarget.REQUEST_OBJECT]);
        }
        if (responseTypes.includes(did_auth_siop_1.ResponseType.ID_TOKEN)) {
            builder.withScope('openid');
        }
        return builder.build();
    }
    getPresentationVerificationCallback(agentContext, options) {
        return async (encodedPresentation, presentationSubmission) => {
            try {
                this.logger.debug(`Presentation response`, core_1.JsonTransformer.toJSON(encodedPresentation));
                this.logger.debug(`Presentation submission`, presentationSubmission);
                if (!encodedPresentation)
                    throw new core_1.CredoError('Did not receive a presentation for verification.');
                let isValid;
                // TODO: it might be better here to look at the presentation submission to know
                // If presentation includes a ~, we assume it's an SD-JWT-VC
                if (typeof encodedPresentation === 'string' && encodedPresentation.includes('~')) {
                    const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
                    const verificationResult = await sdJwtVcApi.verify({
                        compactSdJwtVc: encodedPresentation,
                        keyBinding: {
                            audience: options.audience,
                            nonce: options.nonce,
                        },
                        verifyHs256Callback: options.verifyHs256Callback
                    });
                    isValid = verificationResult.verification.isValid;
                }
                else if (typeof encodedPresentation === 'string') {
                    const verificationResult = await this.w3cCredentialService.verifyPresentation(agentContext, {
                        presentation: encodedPresentation,
                        challenge: options.nonce,
                        domain: options.audience,
                    });
                    isValid = verificationResult.isValid;
                }
                else {
                    const verificationResult = await this.w3cCredentialService.verifyPresentation(agentContext, {
                        presentation: core_1.JsonTransformer.fromJSON(encodedPresentation, core_1.W3cJsonLdVerifiablePresentation),
                        challenge: options.nonce,
                        domain: options.audience,
                    });
                    isValid = verificationResult.isValid;
                }
                // FIXME: we throw an error here as there's a bug in sphereon library where they
                // don't check the returned 'verified' property and only catch errors thrown.
                // Once https://github.com/Sphereon-Opensource/SIOP-OID4VP/pull/70 is merged we
                // can remove this.
                if (!isValid) {
                    throw new core_1.CredoError('Presentation verification failed.');
                }
                return {
                    verified: isValid,
                };
            }
            catch (error) {
                agentContext.config.logger.warn('Error occurred during verification of presentation', {
                    error,
                });
                throw error;
            }
        };
    }
};
exports.OpenId4VcSiopVerifierService = OpenId4VcSiopVerifierService;
exports.OpenId4VcSiopVerifierService = OpenId4VcSiopVerifierService = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [Object, core_1.W3cCredentialService,
        repository_1.OpenId4VcVerifierRepository,
        OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig,
        repository_1.OpenId4VcVerificationSessionRepository])
], OpenId4VcSiopVerifierService);
//# sourceMappingURL=OpenId4VcSiopVerifierService.js.map