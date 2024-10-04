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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerService = void 0;
const core_1 = require("@credo-ts/core");
const oid4vci_issuer_1 = require("@sphereon/oid4vci-issuer");
const shared_1 = require("../shared");
const issuerMetadataUtils_1 = require("../shared/issuerMetadataUtils");
const router_1 = require("../shared/router");
const transform_1 = require("../shared/transform");
const utils_1 = require("../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("./OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerModuleConfig_1 = require("./OpenId4VcIssuerModuleConfig");
const repository_1 = require("./repository");
const OpenId4VcCNonceStateManager_1 = require("./repository/OpenId4VcCNonceStateManager");
const OpenId4VcCredentialOfferSessionStateManager_1 = require("./repository/OpenId4VcCredentialOfferSessionStateManager");
const OpenId4VcCredentialOfferUriStateManager_1 = require("./repository/OpenId4VcCredentialOfferUriStateManager");
const credentialRequest_1 = require("./util/credentialRequest");
const w3cOpenId4VcFormats = [
    shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson,
    shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd,
    shared_1.OpenId4VciCredentialFormatProfile.LdpVc,
];
/**
 * @internal
 */
let OpenId4VcIssuerService = class OpenId4VcIssuerService {
    constructor(w3cCredentialService, jwsService, openId4VcIssuerConfig, openId4VcIssuerRepository, openId4VcIssuanceSessionRepository) {
        this.getJwtVerifyCallback = (agentContext) => {
            return async (opts) => {
                let didDocument = undefined;
                const { isValid, jws } = await this.jwsService.verifyJws(agentContext, {
                    jws: opts.jwt,
                    // Only handles kid as did resolution. JWK is handled by jws service
                    jwkResolver: async ({ protectedHeader: { kid } }) => {
                        if (!kid)
                            throw new core_1.CredoError('Missing kid in protected header.');
                        if (!kid.startsWith('did:'))
                            throw new core_1.CredoError('Only did is supported for kid identifier');
                        const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
                        didDocument = await didsApi.resolveDidDocument(kid);
                        const verificationMethod = didDocument.dereferenceKey(kid, ['authentication', 'assertionMethod']);
                        const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
                        return (0, core_1.getJwkFromKey)(key);
                    },
                });
                if (!isValid)
                    throw new core_1.CredoError('Could not verify JWT signature.');
                // TODO: the jws service should return some better decoded metadata also from the resolver
                // as currently is less useful if you afterwards need properties from the JWS
                const firstJws = jws.signatures[0];
                const protectedHeader = core_1.JsonEncoder.fromBase64(firstJws.protected);
                return {
                    jwt: { header: protectedHeader, payload: core_1.JsonEncoder.fromBase64(jws.payload) },
                    kid: protectedHeader.kid,
                    jwk: protectedHeader.jwk ? (0, core_1.getJwkFromJson)(protectedHeader.jwk) : undefined,
                    did: didDocument === null || didDocument === void 0 ? void 0 : didDocument.id,
                    alg: protectedHeader.alg,
                    didDocument,
                };
            };
        };
        this.getSdJwtVcCredentialSigningCallback = (agentContext, options) => {
            return async () => {
                const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
                const sdJwtVc = await sdJwtVcApi.sign(options);
                return (0, transform_1.getSphereonVerifiableCredential)(sdJwtVc);
            };
        };
        this.getW3cCredentialSigningCallback = (agentContext, options) => {
            return async (opts) => {
                const { jwtVerifyResult, format } = opts;
                const { kid, didDocument: holderDidDocument } = jwtVerifyResult;
                if (!kid)
                    throw new core_1.CredoError('Missing Kid. Cannot create the holder binding');
                if (!holderDidDocument)
                    throw new core_1.CredoError('Missing did document. Cannot create the holder binding.');
                if (!format)
                    throw new core_1.CredoError('Missing format. Cannot issue credential.');
                const formatMap = {
                    [shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson]: core_1.ClaimFormat.JwtVc,
                    [shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd]: core_1.ClaimFormat.JwtVc,
                    [shared_1.OpenId4VciCredentialFormatProfile.LdpVc]: core_1.ClaimFormat.LdpVc,
                };
                const w3cServiceFormat = formatMap[format];
                // Set the binding on the first credential subject if not set yet
                // on any subject
                if (!options.credential.credentialSubjectIds.includes(holderDidDocument.id)) {
                    const credentialSubject = Array.isArray(options.credential.credentialSubject)
                        ? options.credential.credentialSubject[0]
                        : options.credential.credentialSubject;
                    credentialSubject.id = holderDidDocument.id;
                }
                const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
                const issuerDidDocument = await didsApi.resolveDidDocument(options.verificationMethod);
                const verificationMethod = issuerDidDocument.dereferenceVerificationMethod(options.verificationMethod);
                if (w3cServiceFormat === core_1.ClaimFormat.JwtVc) {
                    const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
                    const supportedSignatureAlgorithms = (0, core_1.getJwkFromKey)(key).supportedSignatureAlgorithms;
                    if (supportedSignatureAlgorithms.length === 0) {
                        throw new core_1.CredoError(`No supported JWA signature algorithms found for key with keyType ${key.keyType}`);
                    }
                    const alg = supportedSignatureAlgorithms[0];
                    if (!alg) {
                        throw new core_1.CredoError(`No supported JWA signature algorithms for key type ${key.keyType}`);
                    }
                    const signed = await this.w3cCredentialService.signCredential(agentContext, {
                        format: w3cServiceFormat,
                        credential: options.credential,
                        verificationMethod: options.verificationMethod,
                        alg,
                    });
                    return (0, transform_1.getSphereonVerifiableCredential)(signed);
                }
                else {
                    const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
                    const proofType = (0, utils_1.getProofTypeFromKey)(agentContext, key);
                    const signed = await this.w3cCredentialService.signCredential(agentContext, {
                        format: w3cServiceFormat,
                        credential: options.credential,
                        verificationMethod: options.verificationMethod,
                        proofType: proofType,
                    });
                    return (0, transform_1.getSphereonVerifiableCredential)(signed);
                }
            };
        };
        this.getCredentialDataSupplier = (agentContext, options) => {
            return async (args) => {
                var _a;
                const { issuanceSession, issuer } = options;
                const credentialRequest = args.credentialRequest;
                const issuerMetadata = this.getIssuerMetadata(agentContext, issuer);
                const offeredCredentialsMatchingRequest = this.findOfferedCredentialsMatchingRequest(agentContext, options.issuanceSession.credentialOfferPayload, credentialRequest, issuerMetadata.credentialConfigurationsSupported, issuanceSession);
                const numOfferedCredentialsMatchingRequest = Object.keys(offeredCredentialsMatchingRequest).length;
                if (numOfferedCredentialsMatchingRequest === 0) {
                    throw new core_1.CredoError('No offered credentials match the credential request.');
                }
                if (numOfferedCredentialsMatchingRequest > 1) {
                    agentContext.config.logger.debug('Multiple credentials from credentials supported matching request, picking first one.');
                }
                const mapper = (_a = options.credentialRequestToCredentialMapper) !== null && _a !== void 0 ? _a : this.openId4VcIssuerConfig.credentialEndpoint.credentialRequestToCredentialMapper;
                const credentialConfigurationIds = Object.entries(offeredCredentialsMatchingRequest).map(([credentialConfigurationId]) => credentialConfigurationId);
                const holderBinding = await this.getHolderBindingFromRequest(credentialRequest);
                const signOptions = await mapper({
                    agentContext,
                    issuanceSession,
                    holderBinding,
                    credentialOffer: { credential_offer: issuanceSession.credentialOfferPayload },
                    credentialRequest: credentialRequest,
                    credentialsSupported: (0, issuerMetadataUtils_1.credentialsSupportedV13ToV11)(offeredCredentialsMatchingRequest),
                    credentialConfigurationIds,
                });
                const credentialHasAlreadyBeenIssued = issuanceSession.issuedCredentials.includes(signOptions.credentialSupportedId);
                if (credentialHasAlreadyBeenIssued) {
                    throw new core_1.CredoError(`The requested credential with id '${signOptions.credentialSupportedId}' has already been issued.`);
                }
                const updatedIssuanceSession = await this.openId4VcIssuanceSessionRepository.getById(agentContext, issuanceSession.id);
                updatedIssuanceSession.issuedCredentials.push(signOptions.credentialSupportedId);
                await this.openId4VcIssuanceSessionRepository.update(agentContext, updatedIssuanceSession);
                if (signOptions.format === core_1.ClaimFormat.JwtVc || signOptions.format === core_1.ClaimFormat.LdpVc) {
                    if (!w3cOpenId4VcFormats.includes(credentialRequest.format)) {
                        throw new core_1.CredoError(`The credential to be issued does not match the request. Cannot issue a W3cCredential if the client expects a credential of format '${credentialRequest.format}'.`);
                    }
                    return {
                        format: credentialRequest.format,
                        credential: core_1.JsonTransformer.toJSON(signOptions.credential),
                        signCallback: this.getW3cCredentialSigningCallback(agentContext, signOptions),
                    };
                }
                else if (signOptions.format === core_1.ClaimFormat.SdJwtVc) {
                    if (credentialRequest.format !== shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc) {
                        throw new core_1.CredoError(`Invalid credential format. Expected '${shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc}', received '${credentialRequest.format}'.`);
                    }
                    if (credentialRequest.vct !== signOptions.payload.vct) {
                        throw new core_1.CredoError(`The types of the offered credentials do not match the types of the requested credential. Offered '${signOptions.payload.vct}' Requested '${credentialRequest.vct}'.`);
                    }
                    return {
                        format: credentialRequest.format,
                        // NOTE: we don't use the credential value here as we pass the credential directly to the singer
                        credential: Object.assign({}, signOptions.payload),
                        signCallback: this.getSdJwtVcCredentialSigningCallback(agentContext, signOptions),
                    };
                }
                else {
                    throw new core_1.CredoError(`Unsupported credential format ${signOptions.format}`);
                }
            };
        };
        this.w3cCredentialService = w3cCredentialService;
        this.jwsService = jwsService;
        this.openId4VcIssuerConfig = openId4VcIssuerConfig;
        this.openId4VcIssuerRepository = openId4VcIssuerRepository;
        this.openId4VcIssuanceSessionRepository = openId4VcIssuanceSessionRepository;
    }
    async createCredentialOffer(agentContext, options) {
        var _a, _b, _c, _d;
        const { preAuthorizedCodeFlowConfig, issuer, offeredCredentials } = options;
        const vcIssuer = this.getVcIssuer(agentContext, issuer);
        if (options.preAuthorizedCodeFlowConfig.userPinRequired === false && options.preAuthorizedCodeFlowConfig.txCode) {
            throw new core_1.CredoError('The userPinRequired option must be set to true when using txCode.');
        }
        if (options.preAuthorizedCodeFlowConfig.userPinRequired && !options.preAuthorizedCodeFlowConfig.txCode) {
            options.preAuthorizedCodeFlowConfig.txCode = {};
        }
        if (options.preAuthorizedCodeFlowConfig.txCode && !options.preAuthorizedCodeFlowConfig.userPinRequired) {
            options.preAuthorizedCodeFlowConfig.userPinRequired = true;
        }
        // this checks if the structure of the credentials is correct
        // it throws an error if a offered credential cannot be found in the credentialsSupported
        (0, issuerMetadataUtils_1.getOfferedCredentials)(agentContext, options.offeredCredentials, vcIssuer.issuerMetadata.credential_configurations_supported);
        const uniqueOfferedCredentials = Array.from(new Set(options.offeredCredentials));
        if (uniqueOfferedCredentials.length !== offeredCredentials.length) {
            throw new core_1.CredoError('All offered credentials must have unique ids.');
        }
        // We always use shortened URIs currently
        const hostedCredentialOfferUri = (0, core_1.joinUriParts)(vcIssuer.issuerMetadata.credential_issuer, [
            this.openId4VcIssuerConfig.credentialOfferEndpoint.endpointPath,
            // It doesn't really matter what the url is, as long as it's unique
            core_1.utils.uuid(),
        ]);
        const grants = await this.getGrantsFromConfig(agentContext, preAuthorizedCodeFlowConfig);
        let { uri } = await vcIssuer.createCredentialOfferURI({
            scheme: 'openid-credential-offer',
            grants,
            credential_configuration_ids: offeredCredentials,
            credentialOfferUri: hostedCredentialOfferUri,
            baseUri: options.baseUri,
            credentialDataSupplierInput: options.issuanceMetadata,
            pinLength: (_b = (_a = grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']) === null || _a === void 0 ? void 0 : _a.tx_code) === null || _b === void 0 ? void 0 : _b.length,
        });
        // FIXME: https://github.com/Sphereon-Opensource/OID4VCI/issues/102
        if (uri.includes(hostedCredentialOfferUri)) {
            uri = uri.replace(hostedCredentialOfferUri, encodeURIComponent(hostedCredentialOfferUri));
        }
        const issuanceSessionRepository = this.openId4VcIssuanceSessionRepository;
        const issuanceSession = await issuanceSessionRepository.getSingleByQuery(agentContext, {
            credentialOfferUri: hostedCredentialOfferUri,
        });
        if (options.version !== 'v1.draft13') {
            const v13CredentialOfferPayload = issuanceSession.credentialOfferPayload;
            const v11CredentialOfferPayload = Object.assign(Object.assign({}, v13CredentialOfferPayload), { credentials: v13CredentialOfferPayload.credential_configuration_ids });
            if ((_c = v11CredentialOfferPayload.grants) === null || _c === void 0 ? void 0 : _c['urn:ietf:params:oauth:grant-type:pre-authorized_code']) {
                // property was always defined in v11
                v11CredentialOfferPayload.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'].user_pin_required =
                    (_d = preAuthorizedCodeFlowConfig.userPinRequired) !== null && _d !== void 0 ? _d : false;
            }
            issuanceSession.credentialOfferPayload = v11CredentialOfferPayload;
            await issuanceSessionRepository.update(agentContext, issuanceSession);
        }
        return {
            issuanceSession,
            credentialOffer: uri,
        };
    }
    /**
     * find the issuance session associated with a credential request. You can optionally provide a issuer id if
     * the issuer that the request is associated with is already known.
     */
    async findIssuanceSessionForCredentialRequest(agentContext, { credentialRequest, issuerId }) {
        const cNonce = (0, credentialRequest_1.getCNonceFromCredentialRequest)(credentialRequest);
        const issuanceSession = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(agentContext, {
            issuerId,
            cNonce,
        });
        return issuanceSession;
    }
    async createCredentialResponse(agentContext, options) {
        options.issuanceSession.assertState([
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenCreated,
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived,
            // It is possible to issue multiple credentials in one session
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued,
        ]);
        const { credentialRequest, issuanceSession } = options;
        if (!credentialRequest.proof)
            throw new core_1.CredoError('No proof defined in the credentialRequest.');
        const issuer = await this.getIssuerByIssuerId(agentContext, options.issuanceSession.issuerId);
        const cNonce = (0, credentialRequest_1.getCNonceFromCredentialRequest)(credentialRequest);
        if (issuanceSession.cNonce !== cNonce) {
            throw new core_1.CredoError('The cNonce in the credential request does not match the cNonce in the issuance session.');
        }
        if (!issuanceSession.cNonceExpiresAt) {
            throw new core_1.CredoError('Missing required cNonceExpiresAt in the issuance session. Assuming cNonce is not valid');
        }
        if (Date.now() > issuanceSession.cNonceExpiresAt.getTime()) {
            throw new core_1.CredoError('The cNonce has expired.');
        }
        const vcIssuer = this.getVcIssuer(agentContext, issuer);
        const credentialResponse = await vcIssuer.issueCredential({
            credentialRequest,
            tokenExpiresIn: this.openId4VcIssuerConfig.accessTokenEndpoint.tokenExpiresInSeconds,
            // This can just be combined with signing callback right?
            credentialDataSupplier: this.getCredentialDataSupplier(agentContext, Object.assign(Object.assign({}, options), { issuer })),
            credentialDataSupplierInput: issuanceSession.issuanceMetadata,
            responseCNonce: undefined,
        });
        // NOTE: ONLY REQUIRED FOR V11 COMPAT
        if ((0, utils_1.isCredentialOfferV1Draft13)(options.issuanceSession.credentialOfferPayload)) {
            credentialResponse.format = credentialRequest.format;
        }
        const updatedIssuanceSession = await this.openId4VcIssuanceSessionRepository.getById(agentContext, issuanceSession.id);
        if (!credentialResponse.credential) {
            updatedIssuanceSession.state = OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error;
            updatedIssuanceSession.errorMessage = 'No credential found in the issueCredentialResponse.';
            await this.openId4VcIssuanceSessionRepository.update(agentContext, updatedIssuanceSession);
            throw new core_1.CredoError(updatedIssuanceSession.errorMessage);
        }
        if (credentialResponse.acceptance_token || credentialResponse.transaction_id) {
            updatedIssuanceSession.state = OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error;
            updatedIssuanceSession.errorMessage = 'Acceptance token and transaction id are not yet supported.';
            await this.openId4VcIssuanceSessionRepository.update(agentContext, updatedIssuanceSession);
            throw new core_1.CredoError(updatedIssuanceSession.errorMessage);
        }
        return {
            credentialResponse,
            issuanceSession: updatedIssuanceSession,
        };
    }
    async findIssuanceSessionsByQuery(agentContext, query, queryOptions) {
        return this.openId4VcIssuanceSessionRepository.findByQuery(agentContext, query, queryOptions);
    }
    async getIssuanceSessionById(agentContext, issuanceSessionId) {
        return this.openId4VcIssuanceSessionRepository.getById(agentContext, issuanceSessionId);
    }
    async getAllIssuers(agentContext) {
        return this.openId4VcIssuerRepository.getAll(agentContext);
    }
    async getIssuerByIssuerId(agentContext, issuerId) {
        return this.openId4VcIssuerRepository.getByIssuerId(agentContext, issuerId);
    }
    async updateIssuer(agentContext, issuer) {
        return this.openId4VcIssuerRepository.update(agentContext, issuer);
    }
    async createIssuer(agentContext, options) {
        var _a;
        // TODO: ideally we can store additional data with a key, such as:
        // - createdAt
        // - purpose
        const accessTokenSignerKey = await agentContext.wallet.createKey({
            keyType: core_1.KeyType.Ed25519,
        });
        const openId4VcIssuerBase = {
            issuerId: (_a = options.issuerId) !== null && _a !== void 0 ? _a : core_1.utils.uuid(),
            display: options.display,
            dpopSigningAlgValuesSupported: options.dpopSigningAlgValuesSupported,
            accessTokenPublicKeyFingerprint: accessTokenSignerKey.fingerprint,
        };
        const openId4VcIssuer = options.credentialsSupported
            ? new repository_1.OpenId4VcIssuerRecord(Object.assign(Object.assign({}, openId4VcIssuerBase), { credentialsSupported: options.credentialsSupported }))
            : new repository_1.OpenId4VcIssuerRecord(Object.assign(Object.assign({}, openId4VcIssuerBase), { credentialConfigurationsSupported: options.credentialConfigurationsSupported }));
        await this.openId4VcIssuerRepository.save(agentContext, openId4VcIssuer);
        await (0, router_1.storeActorIdForContextCorrelationId)(agentContext, openId4VcIssuer.issuerId);
        return openId4VcIssuer;
    }
    async rotateAccessTokenSigningKey(agentContext, issuer) {
        const accessTokenSignerKey = await agentContext.wallet.createKey({
            keyType: core_1.KeyType.Ed25519,
        });
        // TODO: ideally we can remove the previous key
        issuer.accessTokenPublicKeyFingerprint = accessTokenSignerKey.fingerprint;
        await this.openId4VcIssuerRepository.update(agentContext, issuer);
    }
    getIssuerMetadata(agentContext, issuerRecord) {
        var _a;
        const config = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
        const issuerUrl = (0, core_1.joinUriParts)(config.baseUrl, [issuerRecord.issuerId]);
        const issuerMetadata = {
            issuerUrl,
            tokenEndpoint: (0, core_1.joinUriParts)(issuerUrl, [config.accessTokenEndpoint.endpointPath]),
            credentialEndpoint: (0, core_1.joinUriParts)(issuerUrl, [config.credentialEndpoint.endpointPath]),
            credentialsSupported: issuerRecord.credentialsSupported,
            credentialConfigurationsSupported: (_a = issuerRecord.credentialConfigurationsSupported) !== null && _a !== void 0 ? _a : (0, shared_1.credentialsSupportedV11ToV13)(agentContext, issuerRecord.credentialsSupported),
            issuerDisplay: issuerRecord.display,
            dpopSigningAlgValuesSupported: issuerRecord.dpopSigningAlgValuesSupported,
        };
        return issuerMetadata;
    }
    getVcIssuer(agentContext, issuer) {
        var _a;
        const issuerMetadata = this.getIssuerMetadata(agentContext, issuer);
        const builder = new oid4vci_issuer_1.VcIssuerBuilder()
            .withCredentialIssuer(issuerMetadata.issuerUrl)
            .withCredentialEndpoint(issuerMetadata.credentialEndpoint)
            .withTokenEndpoint(issuerMetadata.tokenEndpoint)
            .withCredentialConfigurationsSupported((_a = issuer.credentialConfigurationsSupported) !== null && _a !== void 0 ? _a : (0, shared_1.credentialsSupportedV11ToV13)(agentContext, issuer.credentialsSupported))
            .withCNonceStateManager(new OpenId4VcCNonceStateManager_1.OpenId4VcCNonceStateManager(agentContext, issuer.issuerId))
            .withCredentialOfferStateManager(new OpenId4VcCredentialOfferSessionStateManager_1.OpenId4VcCredentialOfferSessionStateManager(agentContext, issuer.issuerId))
            .withCredentialOfferURIStateManager(new OpenId4VcCredentialOfferUriStateManager_1.OpenId4VcCredentialOfferUriStateManager(agentContext, issuer.issuerId))
            .withJWTVerifyCallback(this.getJwtVerifyCallback(agentContext))
            .withCredentialSignerCallback(() => {
            throw new core_1.CredoError('Credential signer callback should be overwritten. This is a no-op');
        });
        if (issuerMetadata.authorizationServer) {
            builder.withAuthorizationServers(issuerMetadata.authorizationServer);
        }
        if (issuerMetadata.issuerDisplay) {
            builder.withIssuerDisplay(issuerMetadata.issuerDisplay);
        }
        return builder.build();
    }
    async getGrantsFromConfig(agentContext, preAuthorizedCodeFlowConfig) {
        var _a, _b;
        const grants = {
            'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                'pre-authorized_code': (_a = preAuthorizedCodeFlowConfig.preAuthorizedCode) !== null && _a !== void 0 ? _a : (await agentContext.wallet.generateNonce()),
                // v11 only
                user_pin_required: (_b = preAuthorizedCodeFlowConfig.userPinRequired) !== null && _b !== void 0 ? _b : false,
                tx_code: preAuthorizedCodeFlowConfig.txCode,
            },
        };
        return grants;
    }
    findOfferedCredentialsMatchingRequest(agentContext, credentialOffer, credentialRequest, allCredentialConfigurationsSupported, issuanceSession) {
        const offeredCredentialsData = (0, utils_1.isCredentialOfferV1Draft13)(credentialOffer)
            ? credentialOffer.credential_configuration_ids
            : credentialOffer.credentials;
        const { credentialConfigurationsSupported: offeredCredentialConfigurations } = (0, issuerMetadataUtils_1.getOfferedCredentials)(agentContext, offeredCredentialsData, allCredentialConfigurationsSupported);
        if ('credential_identifier' in credentialRequest && typeof credentialRequest.credential_identifier === 'string') {
            const offeredCredential = offeredCredentialConfigurations[credentialRequest.credential_identifier];
            if (!offeredCredential) {
                throw new core_1.CredoError(`Requested credential with id '${credentialRequest.credential_identifier}' was not offered.`);
            }
            return {
                [credentialRequest.credential_identifier]: offeredCredential,
            };
        }
        return Object.fromEntries(Object.entries(offeredCredentialConfigurations).filter(([id, offeredCredential]) => {
            var _a, _b, _c;
            if (offeredCredential.format !== credentialRequest.format)
                return false;
            if (issuanceSession.issuedCredentials.includes(id))
                return false;
            if (credentialRequest.format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson &&
                offeredCredential.format === credentialRequest.format) {
                const types = 'credential_definition' in credentialRequest
                    ? credentialRequest.credential_definition.type
                    : credentialRequest.types;
                return (0, core_1.equalsIgnoreOrder)((_a = offeredCredential.credential_definition.type) !== null && _a !== void 0 ? _a : [], types);
            }
            else if (credentialRequest.format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd &&
                offeredCredential.format === credentialRequest.format) {
                const types = 'type' in credentialRequest.credential_definition
                    ? credentialRequest.credential_definition.type
                    : credentialRequest.credential_definition.types;
                return (0, core_1.equalsIgnoreOrder)((_b = offeredCredential.credential_definition.type) !== null && _b !== void 0 ? _b : [], types);
            }
            else if (credentialRequest.format === shared_1.OpenId4VciCredentialFormatProfile.LdpVc &&
                offeredCredential.format === credentialRequest.format) {
                const types = 'type' in credentialRequest.credential_definition
                    ? credentialRequest.credential_definition.type
                    : credentialRequest.credential_definition.types;
                return (0, core_1.equalsIgnoreOrder)((_c = offeredCredential.credential_definition.type) !== null && _c !== void 0 ? _c : [], types);
            }
            else if (credentialRequest.format === shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc &&
                offeredCredential.format === credentialRequest.format) {
                return offeredCredential.vct === credentialRequest.vct;
            }
            return false;
        }));
    }
    async getHolderBindingFromRequest(credentialRequest) {
        var _a;
        if (!((_a = credentialRequest.proof) === null || _a === void 0 ? void 0 : _a.jwt))
            throw new core_1.CredoError('Received a credential request without a proof');
        const jwt = core_1.Jwt.fromSerializedJwt(credentialRequest.proof.jwt);
        if (jwt.header.kid) {
            if (!jwt.header.kid.startsWith('did:')) {
                throw new core_1.CredoError("Only did is supported for 'kid' identifier");
            }
            else if (!jwt.header.kid.includes('#')) {
                throw new core_1.CredoError(`kid containing did MUST point to a specific key within the did document: ${jwt.header.kid}`);
            }
            return {
                method: 'did',
                didUrl: jwt.header.kid,
            };
        }
        else if (jwt.header.jwk) {
            return {
                method: 'jwk',
                jwk: (0, core_1.getJwkFromJson)(jwt.header.jwk),
            };
        }
        else {
            throw new core_1.CredoError('Either kid or jwk must be present in credential request proof header');
        }
    }
};
exports.OpenId4VcIssuerService = OpenId4VcIssuerService;
exports.OpenId4VcIssuerService = OpenId4VcIssuerService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.W3cCredentialService,
        core_1.JwsService,
        OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig,
        repository_1.OpenId4VcIssuerRepository,
        repository_1.OpenId4VcIssuanceSessionRepository])
], OpenId4VcIssuerService);
//# sourceMappingURL=OpenId4VcIssuerService.js.map