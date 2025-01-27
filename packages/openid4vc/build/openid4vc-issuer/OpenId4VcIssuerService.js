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
const oauth2_1 = require("@animo-id/oauth2");
const oid4vci_1 = require("@animo-id/oid4vci");
const core_1 = require("@credo-ts/core");
const openid4vc_verifier_1 = require("../openid4vc-verifier");
const shared_1 = require("../shared");
const callbacks_1 = require("../shared/callbacks");
const issuerMetadataUtils_1 = require("../shared/issuerMetadataUtils");
const router_1 = require("../shared/router");
const utils_1 = require("../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("./OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerEvents_1 = require("./OpenId4VcIssuerEvents");
const OpenId4VcIssuerModuleConfig_1 = require("./OpenId4VcIssuerModuleConfig");
const repository_1 = require("./repository");
const txCode_1 = require("./util/txCode");
/**
 * @internal
 */
let OpenId4VcIssuerService = class OpenId4VcIssuerService {
    constructor(w3cCredentialService, openId4VcIssuerConfig, openId4VcIssuerRepository, openId4VcIssuanceSessionRepository) {
        this.w3cCredentialService = w3cCredentialService;
        this.openId4VcIssuerConfig = openId4VcIssuerConfig;
        this.openId4VcIssuerRepository = openId4VcIssuerRepository;
        this.openId4VcIssuanceSessionRepository = openId4VcIssuanceSessionRepository;
    }
    async createStatelessCredentialOffer(agentContext, options) {
        const { authorizationCodeFlowConfig, issuer, offeredCredentials } = options;
        const vcIssuer = this.getIssuer(agentContext);
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const uniqueOfferedCredentials = Array.from(new Set(options.offeredCredentials));
        if (uniqueOfferedCredentials.length !== offeredCredentials.length) {
            throw new core_1.CredoError('All offered credentials must have unique ids.');
        }
        // Check if all the offered credential configuration ids have a scope value. If not, it won't be possible to actually request
        // issuance of the crednetial later on
        (0, oid4vci_1.extractScopesForCredentialConfigurationIds)({
            credentialConfigurationIds: options.offeredCredentials,
            issuerMetadata,
            throwOnConfigurationWithoutScope: true,
        });
        if (authorizationCodeFlowConfig.authorizationServerUrl === issuerMetadata.credentialIssuer.credential_issuer) {
            throw new core_1.CredoError('Stateless offers can only be created for external authorization servers. Make sure to configure an external authorization server on the issuer record, and provide the authoriation server url.');
        }
        const { credentialOffer, credentialOfferObject } = await vcIssuer.createCredentialOffer({
            credentialConfigurationIds: options.offeredCredentials,
            grants: {
                authorization_code: {
                    authorization_server: authorizationCodeFlowConfig.authorizationServerUrl,
                },
            },
            credentialOfferScheme: options.baseUri,
            issuerMetadata,
        });
        return {
            credentialOffer,
            credentialOfferObject,
        };
    }
    async createCredentialOffer(agentContext, options) {
        var _a, _b, _c, _d, _e, _f;
        const { preAuthorizedCodeFlowConfig, authorizationCodeFlowConfig, issuer, offeredCredentials, version = 'v1.draft11-13', } = options;
        if (!preAuthorizedCodeFlowConfig && !authorizationCodeFlowConfig) {
            throw new core_1.CredoError('Authorization Config or Pre-Authorized Config must be provided.');
        }
        const vcIssuer = this.getIssuer(agentContext);
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const uniqueOfferedCredentials = Array.from(new Set(options.offeredCredentials));
        if (uniqueOfferedCredentials.length !== offeredCredentials.length) {
            throw new core_1.CredoError('All offered credentials must have unique ids.');
        }
        if (uniqueOfferedCredentials.length === 0) {
            throw new core_1.CredoError('You need to offer at least one credential.');
        }
        // We always use shortened URIs currently
        const hostedCredentialOfferUri = (0, core_1.joinUriParts)(issuerMetadata.credentialIssuer.credential_issuer, [
            this.openId4VcIssuerConfig.credentialOfferEndpointPath,
            // It doesn't really matter what the url is, as long as it's unique
            core_1.utils.uuid(),
        ]);
        // Check if all the offered credential configuration ids have a scope value. If not, it won't be possible to actually request
        // issuance of the crednetial later on. For pre-auth it's not needed to add a scope.
        if (options.authorizationCodeFlowConfig) {
            (0, oid4vci_1.extractScopesForCredentialConfigurationIds)({
                credentialConfigurationIds: options.offeredCredentials,
                issuerMetadata,
                throwOnConfigurationWithoutScope: true,
            });
        }
        const grants = await this.getGrantsFromConfig(agentContext, {
            issuerMetadata,
            preAuthorizedCodeFlowConfig,
            authorizationCodeFlowConfig,
        });
        const { credentialOffer, credentialOfferObject } = await vcIssuer.createCredentialOffer({
            credentialConfigurationIds: options.offeredCredentials,
            grants,
            credentialOfferUri: hostedCredentialOfferUri,
            credentialOfferScheme: options.baseUri,
            issuerMetadata: Object.assign({ originalDraftVersion: version === 'v1.draft11-13' ? oid4vci_1.Oid4vciDraftVersion.Draft11 : oid4vci_1.Oid4vciDraftVersion.Draft14 }, issuerMetadata),
        });
        const issuanceSessionRepository = this.openId4VcIssuanceSessionRepository;
        const issuanceSession = new repository_1.OpenId4VcIssuanceSessionRecord({
            credentialOfferPayload: credentialOfferObject,
            credentialOfferUri: hostedCredentialOfferUri,
            issuerId: issuer.issuerId,
            state: OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated,
            authorization: ((_b = (_a = credentialOfferObject.grants) === null || _a === void 0 ? void 0 : _a.authorization_code) === null || _b === void 0 ? void 0 : _b.issuer_state)
                ? {
                    issuerState: (_d = (_c = credentialOfferObject.grants) === null || _c === void 0 ? void 0 : _c.authorization_code) === null || _d === void 0 ? void 0 : _d.issuer_state,
                }
                : undefined,
            presentation: (authorizationCodeFlowConfig === null || authorizationCodeFlowConfig === void 0 ? void 0 : authorizationCodeFlowConfig.requirePresentationDuringIssuance)
                ? {
                    required: true,
                }
                : undefined,
            // TODO: how to mix pre-auth and auth? Need to do state checks
            preAuthorizedCode: (_f = (_e = credentialOfferObject.grants) === null || _e === void 0 ? void 0 : _e[oauth2_1.preAuthorizedCodeGrantIdentifier]) === null || _f === void 0 ? void 0 : _f['pre-authorized_code'],
            userPin: (preAuthorizedCodeFlowConfig === null || preAuthorizedCodeFlowConfig === void 0 ? void 0 : preAuthorizedCodeFlowConfig.txCode)
                ? (0, txCode_1.generateTxCode)(agentContext, preAuthorizedCodeFlowConfig.txCode)
                : undefined,
            issuanceMetadata: options.issuanceMetadata,
        });
        await issuanceSessionRepository.save(agentContext, issuanceSession);
        this.emitStateChangedEvent(agentContext, issuanceSession, null);
        return {
            issuanceSession,
            credentialOffer,
        };
    }
    async createCredentialResponse(agentContext, options) {
        options.issuanceSession.assertState([
            // OfferUriRetrieved is valid when doing auth flow (we should add a check)
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved,
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenCreated,
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived,
            // It is possible to issue multiple credentials in one session
            OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued,
        ]);
        const { issuanceSession } = options;
        const issuer = await this.getIssuerByIssuerId(agentContext, options.issuanceSession.issuerId);
        const vcIssuer = this.getIssuer(agentContext);
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const parsedCredentialRequest = vcIssuer.parseCredentialRequest({
            credentialRequest: options.credentialRequest,
        });
        const { credentialRequest, credentialIdentifier, format, proofs } = parsedCredentialRequest;
        if (credentialIdentifier) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidCredentialRequest,
                error_description: `Using unsupported 'credential_identifier'`,
            });
        }
        if (!format) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.UnsupportedCredentialFormat,
                error_description: `Unsupported credential format '${credentialRequest.format}'`,
            });
        }
        if (!(proofs === null || proofs === void 0 ? void 0 : proofs.jwt) || proofs.jwt.length === 0) {
            const { cNonce, cNonceExpiresInSeconds } = await this.createNonce(agentContext, issuer);
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidProof,
                error_description: 'Missing required proof(s) in credential request',
                c_nonce: cNonce,
                c_nonce_expires_in: cNonceExpiresInSeconds,
            });
        }
        await this.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived);
        let previousNonce = undefined;
        const proofSigners = [];
        for (const jwt of proofs.jwt) {
            const { signer, payload } = await vcIssuer.verifyCredentialRequestJwtProof({
                issuerMetadata,
                jwt,
                clientId: options.issuanceSession.clientId,
            });
            if (!payload.nonce) {
                const { cNonce, cNonceExpiresInSeconds } = await this.createNonce(agentContext, issuer);
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidProof,
                    error_description: 'Missing nonce in proof(s) in credential request',
                    c_nonce: cNonce,
                    c_nonce_expires_in: cNonceExpiresInSeconds,
                });
            }
            // Set previous nonce if not yet set (first iteration)
            if (!previousNonce)
                previousNonce = payload.nonce;
            if (previousNonce !== payload.nonce) {
                const { cNonce, cNonceExpiresInSeconds } = await this.createNonce(agentContext, issuer);
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidProof,
                    error_description: 'Not all nonce values in proofs are equal',
                    c_nonce: cNonce,
                    c_nonce_expires_in: cNonceExpiresInSeconds,
                });
            }
            // Verify the nonce
            await this.verifyNonce(agentContext, issuer, payload.nonce).catch(async (error) => {
                const { cNonce, cNonceExpiresInSeconds } = await this.createNonce(agentContext, issuer);
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidNonce,
                    error_description: 'Invalid nonce in credential request',
                    c_nonce: cNonce,
                    c_nonce_expires_in: cNonceExpiresInSeconds,
                }, {
                    cause: error,
                });
            });
            proofSigners.push(signer);
        }
        const signedCredentials = await this.getSignedCredentials(agentContext, {
            credentialRequest,
            issuanceSession,
            issuer,
            requestFormat: format,
            authorization: options.authorization,
            credentialRequestToCredentialMapper: options.credentialRequestToCredentialMapper,
            proofSigners,
        });
        // NOTE: nonce in credential response is deprecated in newer drafts, but for now we keep it in
        const { cNonce, cNonceExpiresInSeconds } = await this.createNonce(agentContext, issuer);
        const credentialResponse = vcIssuer.createCredentialResponse({
            credential: credentialRequest.proof ? signedCredentials.credentials[0] : undefined,
            credentials: credentialRequest.proofs ? signedCredentials.credentials : undefined,
            cNonce,
            cNonceExpiresInSeconds,
            credentialRequest: parsedCredentialRequest,
        });
        issuanceSession.issuedCredentials.push(signedCredentials.credentialConfigurationId);
        const newState = issuanceSession.issuedCredentials.length >=
            issuanceSession.credentialOfferPayload.credential_configuration_ids.length
            ? OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Completed
            : OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued;
        await this.updateState(agentContext, issuanceSession, newState);
        return {
            credentialResponse,
            issuanceSession,
        };
    }
    async findIssuanceSessionsByQuery(agentContext, query, queryOptions) {
        return this.openId4VcIssuanceSessionRepository.findByQuery(agentContext, query, queryOptions);
    }
    async findSingleIssuancSessionByQuery(agentContext, query) {
        return this.openId4VcIssuanceSessionRepository.findSingleByQuery(agentContext, query);
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
        var _a, _b;
        // TODO: ideally we can store additional data with a key, such as:
        // - createdAt
        // - purpose
        const accessTokenSignerKey = await agentContext.wallet.createKey({
            keyType: (_a = options.accessTokenSignerKeyType) !== null && _a !== void 0 ? _a : core_1.KeyType.Ed25519,
        });
        const openId4VcIssuer = new repository_1.OpenId4VcIssuerRecord({
            issuerId: (_b = options.issuerId) !== null && _b !== void 0 ? _b : core_1.utils.uuid(),
            display: options.display,
            dpopSigningAlgValuesSupported: options.dpopSigningAlgValuesSupported,
            accessTokenPublicKeyFingerprint: accessTokenSignerKey.fingerprint,
            authorizationServerConfigs: options.authorizationServerConfigs,
            credentialConfigurationsSupported: options.credentialConfigurationsSupported,
            batchCredentialIssuance: options.batchCredentialIssuance,
        });
        await this.openId4VcIssuerRepository.save(agentContext, openId4VcIssuer);
        await (0, router_1.storeActorIdForContextCorrelationId)(agentContext, openId4VcIssuer.issuerId);
        return openId4VcIssuer;
    }
    async rotateAccessTokenSigningKey(agentContext, issuer, options) {
        var _a;
        const accessTokenSignerKey = await agentContext.wallet.createKey({
            keyType: (_a = options === null || options === void 0 ? void 0 : options.accessTokenSignerKeyType) !== null && _a !== void 0 ? _a : core_1.KeyType.Ed25519,
        });
        // TODO: ideally we can remove the previous key
        issuer.accessTokenPublicKeyFingerprint = accessTokenSignerKey.fingerprint;
        await this.openId4VcIssuerRepository.update(agentContext, issuer);
    }
    /**
     * @param fetchExternalAuthorizationServerMetadata defaults to false
     */
    async getIssuerMetadata(agentContext, issuerRecord, fetchExternalAuthorizationServerMetadata = false) {
        var _a;
        const config = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
        const issuerUrl = (0, core_1.joinUriParts)(config.baseUrl, [issuerRecord.issuerId]);
        const oauth2Client = this.getOauth2Client(agentContext);
        const extraAuthorizationServers = fetchExternalAuthorizationServerMetadata && issuerRecord.authorizationServerConfigs
            ? await Promise.all(issuerRecord.authorizationServerConfigs.map(async (server) => {
                const metadata = await oauth2Client.fetchAuthorizationServerMetadata(server.issuer);
                if (!metadata)
                    throw new core_1.CredoError(`Authorization server metadata not found for issuer '${server.issuer}'`);
                return metadata;
            }))
            : [];
        const authorizationServers = issuerRecord.authorizationServerConfigs && issuerRecord.authorizationServerConfigs.length > 0
            ? [
                ...issuerRecord.authorizationServerConfigs.map((authorizationServer) => authorizationServer.issuer),
                // Our issuer is also a valid authorization server (only for pre-auth)
                issuerUrl,
            ]
            : undefined;
        const credentialIssuerMetadata = {
            credential_issuer: issuerUrl,
            credential_endpoint: (0, core_1.joinUriParts)(issuerUrl, [config.credentialEndpointPath]),
            credential_configurations_supported: (_a = issuerRecord.credentialConfigurationsSupported) !== null && _a !== void 0 ? _a : {},
            authorization_servers: authorizationServers,
            display: issuerRecord.display,
            nonce_endpoint: (0, core_1.joinUriParts)(issuerUrl, [config.nonceEndpointPath]),
            batch_credential_issuance: issuerRecord.batchCredentialIssuance
                ? {
                    batch_size: issuerRecord.batchCredentialIssuance.batchSize,
                }
                : undefined,
        };
        const issuerAuthorizationServer = {
            issuer: issuerUrl,
            token_endpoint: (0, core_1.joinUriParts)(issuerUrl, [config.accessTokenEndpointPath]),
            'pre-authorized_grant_anonymous_access_supported': true,
            jwks_uri: (0, core_1.joinUriParts)(issuerUrl, [config.jwksEndpointPath]),
            authorization_challenge_endpoint: (0, core_1.joinUriParts)(issuerUrl, [config.authorizationChallengeEndpointPath]),
            // TODO: PAR (maybe not needed as we only use this auth server for presentation during issuance)
            // pushed_authorization_request_endpoint: '',
            // require_pushed_authorization_requests: true
            code_challenge_methods_supported: [oauth2_1.PkceCodeChallengeMethod.S256],
            dpop_signing_alg_values_supported: issuerRecord.dpopSigningAlgValuesSupported,
        };
        return {
            credentialIssuer: credentialIssuerMetadata,
            authorizationServers: [issuerAuthorizationServer, ...extraAuthorizationServers],
        };
    }
    async createNonce(agentContext, issuer) {
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const cNonceExpiresInSeconds = this.openId4VcIssuerConfig.cNonceExpiresInSeconds;
        const cNonceExpiresAt = (0, utils_1.addSecondsToDate)(new Date(), cNonceExpiresInSeconds);
        const key = core_1.Key.fromFingerprint(issuer.accessTokenPublicKeyFingerprint);
        const jwk = (0, core_1.getJwkFromKey)(key);
        const cNonce = await jwsService.createJwsCompact(agentContext, {
            key,
            payload: core_1.JwtPayload.fromJson({
                iss: issuerMetadata.credentialIssuer.credential_issuer,
                exp: (0, utils_1.dateToSeconds)(cNonceExpiresAt),
            }),
            protectedHeaderOptions: {
                typ: 'credo+cnonce',
                kid: issuer.accessTokenPublicKeyFingerprint,
                alg: jwk.supportedSignatureAlgorithms[0],
            },
        });
        return {
            cNonce,
            cNonceExpiresAt,
            cNonceExpiresInSeconds,
        };
    }
    /**
     * @todo nonces are very short lived (1 min), but it might be nice to also cache the nonces
     * in the cache if we have 'seen' them. They will only be in the cache for a short time
     * and it will prevent replay
     */
    async verifyNonce(agentContext, issuer, cNonce) {
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const key = core_1.Key.fromFingerprint(issuer.accessTokenPublicKeyFingerprint);
        const jwk = (0, core_1.getJwkFromKey)(key);
        const jwt = core_1.Jwt.fromSerializedJwt(cNonce);
        jwt.payload.validate();
        if (jwt.payload.iss !== issuerMetadata.credentialIssuer.credential_issuer) {
            throw new core_1.CredoError(`Invalid 'iss' claim in cNonce jwt`);
        }
        if (jwt.header.typ !== 'credo+cnonce') {
            throw new core_1.CredoError(`Invalid 'typ' claim in cNonce jwt header`);
        }
        const verification = await jwsService.verifyJws(agentContext, {
            jws: cNonce,
            jwkResolver: () => jwk,
        });
        if (!verification.signerKeys
            .map((singerKey) => singerKey.fingerprint)
            .includes(issuer.accessTokenPublicKeyFingerprint)) {
            throw new core_1.CredoError('Invalid nonce');
        }
    }
    getIssuer(agentContext) {
        return new oid4vci_1.Oid4vciIssuer({
            callbacks: (0, callbacks_1.getOid4vciCallbacks)(agentContext),
        });
    }
    getOauth2Client(agentContext) {
        return new oauth2_1.Oauth2Client({
            callbacks: (0, callbacks_1.getOid4vciCallbacks)(agentContext),
        });
    }
    getOauth2AuthorizationServer(agentContext) {
        return new oauth2_1.Oauth2AuthorizationServer({
            callbacks: (0, callbacks_1.getOid4vciCallbacks)(agentContext),
        });
    }
    getResourceServer(agentContext, issuerRecord) {
        return new oauth2_1.Oauth2ResourceServer({
            callbacks: Object.assign(Object.assign({}, (0, callbacks_1.getOid4vciCallbacks)(agentContext)), { clientAuthentication: (0, callbacks_1.dynamicOid4vciClientAuthentication)(agentContext, issuerRecord) }),
        });
    }
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     */
    async updateState(agentContext, issuanceSession, newState) {
        agentContext.config.logger.debug(`Updating openid4vc issuance session record ${issuanceSession.id} to state ${newState} (previous=${issuanceSession.state})`);
        const previousState = issuanceSession.state;
        issuanceSession.state = newState;
        await this.openId4VcIssuanceSessionRepository.update(agentContext, issuanceSession);
        this.emitStateChangedEvent(agentContext, issuanceSession, previousState);
    }
    emitStateChangedEvent(agentContext, issuanceSession, previousState) {
        const eventEmitter = agentContext.dependencyManager.resolve(core_1.EventEmitter);
        eventEmitter.emit(agentContext, {
            type: OpenId4VcIssuerEvents_1.OpenId4VcIssuerEvents.IssuanceSessionStateChanged,
            payload: {
                issuanceSession: issuanceSession.clone(),
                previousState: previousState,
            },
        });
    }
    async getGrantsFromConfig(agentContext, config) {
        var _a;
        const { preAuthorizedCodeFlowConfig, authorizationCodeFlowConfig, issuerMetadata } = config;
        // TOOD: export type
        const grants = {};
        // Pre auth
        if (preAuthorizedCodeFlowConfig) {
            const { txCode, authorizationServerUrl, preAuthorizedCode } = preAuthorizedCodeFlowConfig;
            grants[oauth2_1.preAuthorizedCodeGrantIdentifier] = {
                'pre-authorized_code': preAuthorizedCode !== null && preAuthorizedCode !== void 0 ? preAuthorizedCode : (await agentContext.wallet.generateNonce()),
                tx_code: txCode,
                authorization_server: config.issuerMetadata.credentialIssuer.authorization_servers
                    ? authorizationServerUrl
                    : undefined,
            };
        }
        // Auth
        if (authorizationCodeFlowConfig) {
            const { requirePresentationDuringIssuance } = authorizationCodeFlowConfig;
            let authorizationServerUrl = authorizationCodeFlowConfig.authorizationServerUrl;
            if (requirePresentationDuringIssuance) {
                if (authorizationServerUrl && authorizationServerUrl !== issuerMetadata.credentialIssuer.credential_issuer) {
                    throw new core_1.CredoError(`When 'requirePresentationDuringIssuance' is set, 'authorizationServerUrl' must be undefined or match the credential issuer identifier`);
                }
                authorizationServerUrl = issuerMetadata.credentialIssuer.credential_issuer;
            }
            grants.authorization_code = {
                issuer_state: 
                // TODO: the issuer_state should not be guessable, so it's best if we generate it and now allow the user to provide it?
                // but same is true for the pre-auth code and users of credo can also provide that value. We can't easily do unique constraint with askat
                (_a = authorizationCodeFlowConfig.issuerState) !== null && _a !== void 0 ? _a : core_1.TypedArrayEncoder.toBase64URL(agentContext.wallet.getRandomValues(32)),
                authorization_server: config.issuerMetadata.credentialIssuer.authorization_servers
                    ? authorizationServerUrl
                    : undefined,
            };
        }
        return grants;
    }
    async getHolderBindingFromRequestProofs(agentContext, proofSigners) {
        const credentialHolderBindings = [];
        for (const signer of proofSigners) {
            if (signer.method === 'custom' || signer.method === 'x5c') {
                throw new core_1.CredoError(`Only 'jwk' and 'did' based holder binding is supported`);
            }
            if (signer.method === 'jwk') {
                const jwk = (0, core_1.getJwkFromJson)(signer.publicJwk);
                credentialHolderBindings.push({
                    method: 'jwk',
                    jwk,
                    key: jwk.key,
                });
            }
            if (signer.method === 'did') {
                const key = await (0, utils_1.getKeyFromDid)(agentContext, signer.didUrl);
                credentialHolderBindings.push({
                    method: 'did',
                    didUrl: signer.didUrl,
                    key,
                });
            }
        }
        return credentialHolderBindings;
    }
    getCredentialConfigurationsForRequest(options) {
        var _a, _b;
        const { requestFormat, issuanceSession, issuerMetadata, authorization } = options;
        // Check against all credential configurations
        const configurationsMatchingRequest = (0, oid4vci_1.getCredentialConfigurationsMatchingRequestFormat)({
            requestFormat,
            credentialConfigurations: issuerMetadata.credentialIssuer.credential_configurations_supported,
        });
        if (Object.keys(configurationsMatchingRequest).length === 0) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidCredentialRequest,
                error_description: 'Credential request does not match any credential configuration',
            });
        }
        // Limit to offered configurations
        const configurationsMatchingRequestAndOffer = (0, issuerMetadataUtils_1.getOfferedCredentials)(issuanceSession.credentialOfferPayload.credential_configuration_ids, configurationsMatchingRequest, { ignoreNotFoundIds: true });
        if (Object.keys(configurationsMatchingRequestAndOffer).length === 0) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidCredentialRequest,
                error_description: 'Credential request does not match any credential configurations from credential offer',
            });
        }
        // Limit to not-issued configurations
        const configurationsMatchingRequestAndOfferNotIssued = (0, issuerMetadataUtils_1.getOfferedCredentials)(issuanceSession.credentialOfferPayload.credential_configuration_ids.filter((id) => !issuanceSession.issuedCredentials.includes(id)), configurationsMatchingRequestAndOffer, { ignoreNotFoundIds: true });
        if (Object.keys(configurationsMatchingRequestAndOfferNotIssued).length === 0) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidCredentialRequest,
                error_description: 'Credential request does not match any credential configurations from credential offer that have not been issued yet',
            });
        }
        // For pre-auth we allow all ids from the offer
        if (authorization.accessToken.payload['pre-authorized_code']) {
            return {
                credentialConfigurations: configurationsMatchingRequestAndOfferNotIssued,
                credentialConfigurationIds: Object.keys(configurationsMatchingRequestAndOfferNotIssued),
            };
        }
        // Limit to scopes from the token
        // We only do this for auth flow, so it's not required to add a scope for every configuration.
        const configurationsMatchingRequestOfferScope = (0, issuerMetadataUtils_1.getCredentialConfigurationsSupportedForScopes)(configurationsMatchingRequestAndOfferNotIssued, (_b = (_a = authorization.accessToken.payload.scope) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : []);
        if (Object.keys(configurationsMatchingRequestOfferScope).length === 0) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InsufficientScope,
                error_description: 'Scope does not grant issuance for any requested credential configurations from credential offer',
            }, {
                status: 403,
            });
        }
        return {
            credentialConfigurations: configurationsMatchingRequestOfferScope,
            credentialConfigurationIds: Object.keys(configurationsMatchingRequestOfferScope),
        };
    }
    async getSignedCredentials(agentContext, options) {
        var _a, _b;
        const { issuanceSession, issuer, requestFormat, authorization } = options;
        const issuerMetadata = await this.getIssuerMetadata(agentContext, issuer);
        const { credentialConfigurations, credentialConfigurationIds } = this.getCredentialConfigurationsForRequest({
            issuanceSession,
            issuerMetadata,
            requestFormat,
            authorization,
        });
        const mapper = (_a = options.credentialRequestToCredentialMapper) !== null && _a !== void 0 ? _a : this.openId4VcIssuerConfig.credentialRequestToCredentialMapper;
        let verification = undefined;
        // NOTE: this will throw an error if the verifier module is not registered and there is a
        // verification session. But you can't get here without the verifier module anyway
        if ((_b = issuanceSession.presentation) === null || _b === void 0 ? void 0 : _b.openId4VcVerificationSessionId) {
            const verifierApi = agentContext.dependencyManager.resolve(openid4vc_verifier_1.OpenId4VcVerifierApi);
            const session = await verifierApi.getVerificationSessionById(issuanceSession.presentation.openId4VcVerificationSessionId);
            const response = await verifierApi.getVerifiedAuthorizationResponse(issuanceSession.presentation.openId4VcVerificationSessionId);
            if (response.presentationExchange) {
                verification = {
                    session,
                    presentationExchange: response.presentationExchange,
                };
            }
            else if (response.dcql) {
                verification = {
                    session,
                    dcql: response.dcql,
                };
            }
            else {
                throw new core_1.CredoError(`Verified authorization response for verification session with id '${session.id}' does not have presenationExchange or dcql defined.`);
            }
        }
        const holderBindings = await this.getHolderBindingFromRequestProofs(agentContext, options.proofSigners);
        const signOptions = await mapper({
            agentContext,
            issuanceSession,
            holderBindings,
            credentialOffer: issuanceSession.credentialOfferPayload,
            verification,
            credentialRequest: options.credentialRequest,
            credentialRequestFormat: options.requestFormat,
            // Macthing credential configuration ids
            credentialConfigurationsSupported: credentialConfigurations,
            credentialConfigurationIds,
            // Authorization
            authorization: options.authorization,
        });
        if (!credentialConfigurationIds.includes(signOptions.credentialConfigurationId)) {
            throw new core_1.CredoError(`Credential request to credential mapper returned credential configuration id '${signOptions.credentialConfigurationId}' but is not part of provided input credential configuration ids. Allowed values are '${credentialConfigurationIds.join(', ')}'.`);
        }
        // NOTE: we may want to allow a mismatch between this (as with new attestations not every key
        // needs a separate proof), but for now it needs to match
        if (signOptions.credentials.length !== holderBindings.length) {
            throw new core_1.CredoError(`Credential request to credential mapper returned '${signOptions.credentials.length}' to be signed, while only '${holderBindings.length}' holder binding entries were provided. Make sure to return one credential for each holder binding entry`);
        }
        if (signOptions.format === core_1.ClaimFormat.JwtVc || signOptions.format === core_1.ClaimFormat.LdpVc) {
            const oid4vciFormatMap = {
                [shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson]: core_1.ClaimFormat.JwtVc,
                [shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd]: core_1.ClaimFormat.JwtVc,
                [shared_1.OpenId4VciCredentialFormatProfile.LdpVc]: core_1.ClaimFormat.LdpVc,
            };
            const expectedClaimFormat = oid4vciFormatMap[options.requestFormat.format];
            if (signOptions.format !== expectedClaimFormat) {
                throw new core_1.CredoError(`Invalid credential format returned by sign options. Expected '${expectedClaimFormat}', received '${signOptions.format}'.`);
            }
            return {
                credentialConfigurationId: signOptions.credentialConfigurationId,
                format: requestFormat.format,
                credentials: (await Promise.all(signOptions.credentials.map((credential) => this.signW3cCredential(agentContext, signOptions.format, credential).then((signed) => signed.encoded)))),
            };
        }
        else if (signOptions.format === core_1.ClaimFormat.SdJwtVc) {
            if (signOptions.format !== requestFormat.format) {
                throw new core_1.CredoError(`Invalid credential format returned by sign options. Expected '${requestFormat.format}', received '${signOptions.format}'.`);
            }
            if (!signOptions.credentials.every((c) => c.payload.vct === requestFormat.vct)) {
                throw new core_1.CredoError(`One or more vct values of the offered credential(s) do not match the vct of the requested credential. Offered ${Array.from(new Set(signOptions.credentials.map((c) => `'${c.payload.vct}'`))).join(', ')} Requested '${requestFormat.vct}'.`);
            }
            const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
            return {
                credentialConfigurationId: signOptions.credentialConfigurationId,
                format: shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc,
                credentials: await Promise.all(signOptions.credentials.map((credential) => sdJwtVcApi.sign(credential).then((signed) => signed.compact))),
            };
        }
        else if (signOptions.format === core_1.ClaimFormat.MsoMdoc) {
            if (signOptions.format !== requestFormat.format) {
                throw new core_1.CredoError(`Invalid credential format returned by sign options. Expected '${requestFormat.format}', received '${signOptions.format}'.`);
            }
            if (!signOptions.credentials.every((c) => c.docType === requestFormat.doctype)) {
                throw new core_1.CredoError(`One or more doctype values of the offered credential(s) do not match the doctype of the requested credential. Offered ${Array.from(new Set(signOptions.credentials.map((c) => `'${c.docType}'`))).join(', ')} Requested '${requestFormat.doctype}'.`);
            }
            const mdocApi = agentContext.dependencyManager.resolve(core_1.MdocApi);
            return {
                credentialConfigurationId: signOptions.credentialConfigurationId,
                format: shared_1.OpenId4VciCredentialFormatProfile.MsoMdoc,
                credentials: await Promise.all(signOptions.credentials.map((credential) => mdocApi.sign(credential).then((signed) => signed.base64Url))),
            };
        }
        else {
            throw new core_1.CredoError(`Unsupported credential format ${signOptions.format}`);
        }
    }
    async signW3cCredential(agentContext, format, options) {
        const key = await (0, utils_1.getKeyFromDid)(agentContext, options.verificationMethod);
        if (format === core_1.ClaimFormat.JwtVc) {
            const supportedSignatureAlgorithms = (0, core_1.getJwkFromKey)(key).supportedSignatureAlgorithms;
            if (supportedSignatureAlgorithms.length === 0) {
                throw new core_1.CredoError(`No supported JWA signature algorithms found for key with keyType ${key.keyType}`);
            }
            const alg = supportedSignatureAlgorithms[0];
            if (!alg) {
                throw new core_1.CredoError(`No supported JWA signature algorithms for key type ${key.keyType}`);
            }
            return await this.w3cCredentialService.signCredential(agentContext, {
                format: core_1.ClaimFormat.JwtVc,
                credential: options.credential,
                verificationMethod: options.verificationMethod,
                alg,
            });
        }
        else {
            const proofType = (0, utils_1.getProofTypeFromKey)(agentContext, key);
            return await this.w3cCredentialService.signCredential(agentContext, {
                format: core_1.ClaimFormat.LdpVc,
                credential: options.credential,
                verificationMethod: options.verificationMethod,
                proofType: proofType,
            });
        }
    }
};
exports.OpenId4VcIssuerService = OpenId4VcIssuerService;
exports.OpenId4VcIssuerService = OpenId4VcIssuerService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.W3cCredentialService,
        OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig,
        repository_1.OpenId4VcIssuerRepository,
        repository_1.OpenId4VcIssuanceSessionRepository])
], OpenId4VcIssuerService);
//# sourceMappingURL=OpenId4VcIssuerService.js.map