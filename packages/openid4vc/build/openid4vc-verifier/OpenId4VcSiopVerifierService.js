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
        var _a, _b, _c;
        const nonce = await agentContext.wallet.generateNonce();
        const state = await agentContext.wallet.generateNonce();
        // Correlation id will be the id of the verification session record
        const correlationId = core_1.utils.uuid();
        let authorizationResponseUrl = (0, core_1.joinUriParts)(this.config.baseUrl, [
            options.verifier.verifierId,
            this.config.authorizationEndpoint.endpointPath,
        ]);
        const federationClientId = (0, core_1.joinUriParts)(this.config.baseUrl, [options.verifier.verifierId]);
        const jwtIssuer = options.requestSigner.method === 'x5c'
            ? await (0, utils_1.openIdTokenIssuerToJwtIssuer)(agentContext, Object.assign(Object.assign({}, options.requestSigner), { issuer: authorizationResponseUrl }))
            : options.requestSigner.method === 'openid-federation'
                ? await (0, utils_1.openIdTokenIssuerToJwtIssuer)(agentContext, Object.assign(Object.assign({}, options.requestSigner), { entityId: federationClientId }))
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
        else if (jwtIssuer.method === 'custom') {
            if (((_a = jwtIssuer.options) === null || _a === void 0 ? void 0 : _a.method) === 'openid-federation') {
                clientIdScheme = 'entity_id';
                clientId = federationClientId;
            }
            else {
                throw new core_1.CredoError(`jwtIssuer 'method' 'custom' must have a 'method' property with value 'openid-federation' when using the 'custom' method.`);
            }
        }
        else {
            throw new core_1.CredoError(`Unsupported jwt issuer method '${options.requestSigner.method}'. Only 'did', 'x5c' and 'custom' are supported.`);
        }
        const relyingParty = await this.getRelyingParty(agentContext, options.verifier, {
            presentationDefinition: (_b = options.presentationExchange) === null || _b === void 0 ? void 0 : _b.definition,
            dcqlQuery: (_c = options.dcql) === null || _c === void 0 ? void 0 : _c.query,
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
        });
        // NOTE: it's not possible to set the uri scheme when using the RP to create an auth request, only lower level
        // functions allow this. So we need to replace the uri scheme manually.
        let authorizationRequestUri = (await authorizationRequest.uri()).encodedUri;
        if ((options.presentationExchange || options.dcql) && !options.idToken) {
            authorizationRequestUri = authorizationRequestUri.replace('openid://', 'openid4vp://');
        }
        else {
            authorizationRequestUri = authorizationRequestUri.replace('openid4vp://', 'openid://');
        }
        const verificationSession = await verificationSessionCreatedPromise;
        return {
            authorizationRequest: authorizationRequestUri,
            verificationSession,
        };
    }
    async verifyAuthorizationResponse(agentContext, options) {
        var _a, _b;
        // Assert state
        options.verificationSession.assertState([
            OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved,
            OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated,
        ]);
        const authorizationRequest = await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(options.verificationSession.authorizationRequestJwt);
        const verifier = await this.getVerifierByVerifierId(agentContext, options.verificationSession.verifierId);
        const requestClientId = await authorizationRequest.getMergedProperty('client_id');
        // TODO: Is this needed for the verification of the federation?
        const requestClientIdScheme = await authorizationRequest.getMergedProperty('client_id_scheme');
        const requestNonce = await authorizationRequest.getMergedProperty('nonce');
        const requestState = await authorizationRequest.getMergedProperty('state');
        const responseUri = await authorizationRequest.getMergedProperty('response_uri');
        const presentationDefinitionsWithLocation = await authorizationRequest.getPresentationDefinitions();
        const dcqlQuery = await authorizationRequest.getDcqlQuery();
        if (!requestNonce || !requestClientId || !requestState) {
            throw new core_1.CredoError(`Unable to find nonce, state, or client_id in authorization request for verification session '${options.verificationSession.id}'`);
        }
        const authorizationResponseUrl = (0, core_1.joinUriParts)(this.config.baseUrl, [
            options.verificationSession.verifierId,
            this.config.authorizationEndpoint.endpointPath,
        ]);
        const relyingParty = await this.getRelyingParty(agentContext, verifier, {
            presentationDefinition: (_a = presentationDefinitionsWithLocation === null || presentationDefinitionsWithLocation === void 0 ? void 0 : presentationDefinitionsWithLocation[0]) === null || _a === void 0 ? void 0 : _a.definition,
            dcqlQuery,
            authorizationResponseUrl,
            clientId: requestClientId,
            clientIdScheme: requestClientIdScheme,
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
            dcqlQuery,
            verification: {
                presentationVerificationCallback: this.getPresentationVerificationCallback(agentContext, {
                    correlationId: options.verificationSession.id,
                    nonce: requestNonce,
                    audience: requestClientId,
                    responseUri,
                    mdocGeneratedNonce: ((_b = options.jarmHeader) === null || _b === void 0 ? void 0 : _b.apu)
                        ? core_1.TypedArrayEncoder.toUtf8String(core_1.TypedArrayEncoder.fromBase64(options.jarmHeader.apu))
                        : '',
                    verificationSessionRecordId: options.verificationSession.id,
                }),
            },
        });
        const verificationSession = await verificationSessionUpdatedPromise;
        const verifiedAuthorizationResponse = await this.getVerifiedAuthorizationResponse(verificationSession);
        return Object.assign(Object.assign({}, verifiedAuthorizationResponse), { verificationSession: await verificationSessionUpdatedPromise });
    }
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
            const rawPresentations = authorizationResponse.payload.vp_token
                ? await (0, OpenID4VP_1.extractPresentationsFromVpToken)(authorizationResponse.payload.vp_token, {
                    hasher: core_1.Hasher.hash,
                })
                : [];
            // TODO: Probably wise to check against request for the location of the submission_data
            const submission = (_d = (_c = (_b = idToken === null || idToken === void 0 ? void 0 : idToken.payload) === null || _b === void 0 ? void 0 : _b._vp_token) === null || _c === void 0 ? void 0 : _c.presentation_submission) !== null && _d !== void 0 ? _d : authorizationResponse.payload.presentation_submission;
            if (!submission) {
                throw new core_1.CredoError('Unable to extract submission from the response.');
            }
            // FIXME: should return type be an array? As now it doesn't always match the submission
            const verifiablePresentations = Array.isArray(rawPresentations)
                ? rawPresentations.map(transform_1.getVerifiablePresentationFromSphereonWrapped)
                : (0, transform_1.getVerifiablePresentationFromSphereonWrapped)(rawPresentations);
            const definition = presentationDefinitions[0].definition;
            presentationExchange = {
                definition,
                submission,
                // We always return this as an array
                presentations: Array.isArray(verifiablePresentations) ? verifiablePresentations : [verifiablePresentations],
                descriptors: (0, core_1.extractPresentationsWithDescriptorsFromSubmission)(verifiablePresentations, submission, definition),
            };
        }
        let dcql = undefined;
        const dcqlQuery = await authorizationRequest.getDcqlQuery();
        if (dcqlQuery) {
            const dcqlQueryVpToken = authorizationResponse.payload.vp_token;
            const dcqlPresentation = Object.fromEntries(Object.entries((0, OpenID4VP_1.extractDcqlPresentationFromDcqlVpToken)(dcqlQueryVpToken, { hasher: core_1.Hasher.hash })).map(([key, value]) => {
                return [key, (0, transform_1.getVerifiablePresentationFromSphereonWrapped)(value)];
            }));
            const presentationQueryResult = await (0, did_auth_siop_1.assertValidDcqlPresentationResult)(authorizationResponse.payload.vp_token, dcqlQuery, { hasher: core_1.Hasher.hash });
            dcql = { presentation: dcqlPresentation, presentationResult: presentationQueryResult };
        }
        if (!idToken && !(presentationExchange || dcqlQuery)) {
            throw new core_1.CredoError('No idToken or presentationExchange found in the response.');
        }
        return {
            idToken,
            presentationExchange,
            dcql,
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
            if (!nonce && !state) {
                throw new core_1.CredoError('Could not extract nonce or state from authorization response. Unable to find OpenId4VcVerificationSession.');
            }
        }
        else {
            if ((authorizationResponseParams === null || authorizationResponseParams === void 0 ? void 0 : authorizationResponseParams.nonce) && !(authorizationResponseParams === null || authorizationResponseParams === void 0 ? void 0 : authorizationResponseParams.state)) {
                throw new core_1.CredoError('Either nonce or state must be provided if no authorization response is provided. Unable to find OpenId4VcVerificationSession.');
            }
            nonce = authorizationResponseParams === null || authorizationResponseParams === void 0 ? void 0 : authorizationResponseParams.nonce;
            state = authorizationResponseParams === null || authorizationResponseParams === void 0 ? void 0 : authorizationResponseParams.state;
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
            clientMetadata: options === null || options === void 0 ? void 0 : options.clientMetadata,
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
    async getRelyingParty(agentContext, verifier, { idToken, presentationDefinition, dcqlQuery, clientId, clientIdScheme, authorizationResponseUrl, responseMode, }) {
        const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
        const supportedAlgs = (0, utils_1.getSupportedJwaSignatureAlgorithms)(agentContext);
        const supportedProofTypes = signatureSuiteRegistry.supportedProofTypes;
        // Check: audience must be set to the issuer with dynamic disc otherwise self-issued.me/v2.
        const builder = did_auth_siop_1.RP.builder();
        const responseTypes = [];
        if (!(presentationDefinition && dcqlQuery) && idToken === false) {
            throw new core_1.CredoError('`PresentationExchange` `DcqlQuery` or `idToken` must be enabled.');
        }
        if (presentationDefinition || dcqlQuery) {
            responseTypes.push(did_auth_siop_1.ResponseType.VP_TOKEN);
        }
        if (idToken === true || !(presentationDefinition || dcqlQuery)) {
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
            .getEventEmitterForVerifier(agentContext.contextCorrelationId, verifier.verifierId);
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
            .withClientId(clientId)
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
            .withSessionManager(new OpenId4VcRelyingPartySessionManager_1.OpenId4VcRelyingPartySessionManager(agentContext, verifier.verifierId))
            .withEventEmitter(sphereonEventEmitter)
            .withResponseType(responseTypes)
            .withCreateJwtCallback((0, utils_1.getCreateJwtCallback)(agentContext))
            .withVerifyJwtCallback((0, utils_1.getVerifyJwtCallback)(agentContext))
            // TODO: we should probably allow some dynamic values here
            .withClientMetadata(Object.assign(Object.assign(Object.assign({}, jarmClientMetadata), verifier.clientMetadata), { 
            // FIXME: not passing client_id here means it will not be added
            // to the authorization request url (not the signed payload). Need
            // to fix that in Sphereon lib
            client_id: clientId, passBy: did_auth_siop_1.PassBy.VALUE, response_types_supported: [did_auth_siop_1.ResponseType.VP_TOKEN], subject_syntax_types_supported: [
                'urn:ietf:params:oauth:jwk-thumbprint',
                ...supportedDidMethods.map((m) => `did:${m}`),
            ], vp_formats: {
                mso_mdoc: {
                    alg: supportedAlgs,
                },
                jwt_vc: {
                    alg: supportedAlgs,
                },
                jwt_vc_json: {
                    alg: supportedAlgs,
                },
                jwt_vp_json: {
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
                    'kb-jwt_alg_values': supportedAlgs,
                    'sd-jwt_alg_values': supportedAlgs,
                },
            } }));
        if (clientIdScheme) {
            builder.withClientIdScheme(clientIdScheme);
            if (clientIdScheme === 'entity_id') {
                builder.withEntityId(clientId);
            }
        }
        if (presentationDefinition) {
            builder.withPresentationDefinition({ definition: presentationDefinition }, [did_auth_siop_1.PropertyTarget.REQUEST_OBJECT]);
        }
        if (dcqlQuery) {
            builder.withDcqlQuery(JSON.stringify(dcqlQuery));
        }
        if (responseTypes.includes(did_auth_siop_1.ResponseType.ID_TOKEN)) {
            builder.withScope('openid');
        }
        return builder.build();
    }
    getPresentationVerificationCallback(agentContext, options) {
        return async (encodedPresentation, presentationSubmission) => {
            var _a, _b, _c, _d, _e;
            try {
                this.logger.debug(`Presentation response`, core_1.JsonTransformer.toJSON(encodedPresentation));
                this.logger.debug(`Presentation submission`, presentationSubmission);
                if (!encodedPresentation)
                    throw new core_1.CredoError('Did not receive a presentation for verification.');
                const x509Config = agentContext.dependencyManager.resolve(core_1.X509ModuleConfig);
                let isValid;
                let reason = undefined;
                if (typeof encodedPresentation === 'string' && encodedPresentation.includes('~')) {
                    // TODO: it might be better here to look at the presentation submission to know
                    // If presentation includes a ~, we assume it's an SD-JWT-VC
                    const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
                    const jwt = core_1.Jwt.fromSerializedJwt(encodedPresentation.split('~')[0]);
                    const sdJwtVc = sdJwtVcApi.fromCompact(encodedPresentation);
                    const certificateChain = (0, core_1.extractX509CertificatesFromJwt)(jwt);
                    let trustedCertificates = undefined;
                    if (certificateChain && x509Config.getTrustedCertificatesForVerification) {
                        trustedCertificates = await x509Config.getTrustedCertificatesForVerification(agentContext, {
                            certificateChain,
                            verification: {
                                type: 'credential',
                                credential: sdJwtVc,
                                openId4VcVerificationSessionId: options.verificationSessionRecordId,
                            },
                        });
                    }
                    if (!trustedCertificates) {
                        // We also take from the config here to avoid the callback being called again
                        trustedCertificates = (_a = x509Config.trustedCertificates) !== null && _a !== void 0 ? _a : [];
                    }
                    const verificationResult = await sdJwtVcApi.verify({
                        compactSdJwtVc: encodedPresentation,
                        keyBinding: {
                            audience: options.audience,
                            nonce: options.nonce,
                        },
                        trustedCertificates,
                    });
                    isValid = verificationResult.verification.isValid;
                    reason = verificationResult.isValid ? undefined : verificationResult.error.message;
                }
                else if (typeof encodedPresentation === 'string' && !core_1.Jwt.format.test(encodedPresentation)) {
                    if (!options.responseUri || !options.mdocGeneratedNonce) {
                        isValid = false;
                        reason = 'Mdoc device response verification failed. Response uri and the mdocGeneratedNonce are not set';
                    }
                    else {
                        const mdocDeviceResponse = core_1.MdocDeviceResponse.fromBase64Url(encodedPresentation);
                        const trustedCertificates = (await Promise.all(mdocDeviceResponse.documents.map(async (mdoc) => {
                            var _a, _b;
                            const certificateChain = mdoc.issuerSignedCertificateChain.map((cert) => core_1.X509Certificate.fromRawCertificate(cert));
                            return ((_b = (await ((_a = x509Config.getTrustedCertificatesForVerification) === null || _a === void 0 ? void 0 : _a.call(x509Config, agentContext, {
                                certificateChain,
                                verification: {
                                    type: 'credential',
                                    credential: mdoc,
                                    openId4VcVerificationSessionId: options.verificationSessionRecordId,
                                },
                                // TODO: could have some duplication but not a big issue
                            })))) !== null && _b !== void 0 ? _b : x509Config.trustedCertificates);
                        })))
                            .filter((c) => c !== undefined)
                            .flatMap((c) => c);
                        await mdocDeviceResponse.verify(agentContext, {
                            sessionTranscriptOptions: {
                                clientId: options.audience,
                                mdocGeneratedNonce: options.mdocGeneratedNonce,
                                responseUri: options.responseUri,
                                verifierGeneratedNonce: options.nonce,
                            },
                            trustedCertificates,
                        });
                        isValid = true;
                    }
                }
                else if (typeof encodedPresentation === 'string' && core_1.Jwt.format.test(encodedPresentation)) {
                    const presentation = core_1.W3cJwtVerifiablePresentation.fromSerializedJwt(encodedPresentation);
                    const certificateChain = (0, core_1.extractX509CertificatesFromJwt)(presentation.jwt);
                    let trustedCertificates = undefined;
                    if (certificateChain && x509Config.getTrustedCertificatesForVerification) {
                        trustedCertificates = await ((_b = x509Config.getTrustedCertificatesForVerification) === null || _b === void 0 ? void 0 : _b.call(x509Config, agentContext, {
                            certificateChain,
                            verification: {
                                type: 'credential',
                                credential: presentation,
                                openId4VcVerificationSessionId: options.verificationSessionRecordId,
                            },
                        }));
                    }
                    if (!trustedCertificates) {
                        trustedCertificates = (_c = x509Config.trustedCertificates) !== null && _c !== void 0 ? _c : [];
                    }
                    const verificationResult = await this.w3cCredentialService.verifyPresentation(agentContext, {
                        presentation: encodedPresentation,
                        challenge: options.nonce,
                        domain: options.audience,
                        trustedCertificates,
                    });
                    isValid = verificationResult.isValid;
                    reason = (_d = verificationResult.error) === null || _d === void 0 ? void 0 : _d.message;
                }
                else {
                    const verificationResult = await this.w3cCredentialService.verifyPresentation(agentContext, {
                        presentation: core_1.JsonTransformer.fromJSON(encodedPresentation, core_1.W3cJsonLdVerifiablePresentation),
                        challenge: options.nonce,
                        domain: options.audience,
                    });
                    isValid = verificationResult.isValid;
                    reason = (_e = verificationResult.error) === null || _e === void 0 ? void 0 : _e.message;
                }
                if (!isValid) {
                    throw new Error(reason);
                }
                return {
                    verified: true,
                };
            }
            catch (error) {
                agentContext.config.logger.warn('Error occurred during verification of presentation', {
                    error,
                });
                return {
                    verified: false,
                    reason: error.message,
                };
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