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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VciHolderService = void 0;
const core_1 = require("@credo-ts/core");
const oid4vci_client_1 = require("@sphereon/oid4vci-client");
const oid4vci_common_1 = require("@sphereon/oid4vci-common");
const shared_1 = require("../shared");
const issuerMetadataUtils_1 = require("../shared/issuerMetadataUtils");
const utils_1 = require("../shared/utils");
const OpenId4VciHolderServiceOptions_1 = require("./OpenId4VciHolderServiceOptions");
let OpenId4VciHolderService = class OpenId4VciHolderService {
    constructor(logger, w3cCredentialService, jwsService) {
        this.w3cCredentialService = w3cCredentialService;
        this.jwsService = jwsService;
        this.logger = logger;
    }
    async resolveCredentialOffer(agentContext, credentialOffer) {
        var _a, _b;
        const client = await oid4vci_client_1.OpenID4VCIClient.fromURI({
            uri: credentialOffer,
            resolveOfferUri: true,
            retrieveServerMetadata: true,
            // This is a separate call, so we don't fetch it here, however it may be easier to just construct it here?
            createAuthorizationRequestURL: false,
        });
        if (!((_a = client.credentialOffer) === null || _a === void 0 ? void 0 : _a.credential_offer)) {
            throw new core_1.CredoError(`Could not resolve credential offer from '${credentialOffer}'`);
        }
        const metadata = client.endpointMetadata;
        const credentialIssuerMetadata = metadata.credentialIssuerMetadata;
        if (!credentialIssuerMetadata) {
            throw new core_1.CredoError(`Could not retrieve issuer metadata from '${metadata.issuer}'`);
        }
        this.logger.info('Fetched server metadata', {
            issuer: metadata.issuer,
            credentialEndpoint: metadata.credential_endpoint,
            tokenEndpoint: metadata.token_endpoint,
        });
        this.logger.debug('Full server metadata', metadata);
        const credentialOfferPayload = client.credentialOffer.credential_offer;
        const offeredCredentialsData = (0, utils_1.isCredentialOfferV1Draft13)(credentialOfferPayload)
            ? credentialOfferPayload.credential_configuration_ids
            : credentialOfferPayload.credentials;
        const { credentialConfigurationsSupported, credentialsSupported } = (0, issuerMetadataUtils_1.getOfferedCredentials)(agentContext, offeredCredentialsData, (_b = credentialIssuerMetadata.credentials_supported) !== null && _b !== void 0 ? _b : credentialIssuerMetadata.credential_configurations_supported);
        return {
            metadata: Object.assign(Object.assign({}, metadata), { credentialIssuerMetadata: credentialIssuerMetadata }),
            offeredCredentials: credentialsSupported,
            offeredCredentialConfigurations: credentialConfigurationsSupported,
            credentialOfferPayload,
            credentialOfferRequestWithBaseUrl: client.credentialOffer,
            version: client.version(),
        };
    }
    getAuthDetailsFromOfferedCredential(offeredCredential, authDetailsLocation) {
        const { format } = offeredCredential;
        const type = 'openid_credential';
        const locations = authDetailsLocation ? [authDetailsLocation] : undefined;
        if (format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson) {
            return { type, format, types: offeredCredential.types, locations };
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.LdpVc ||
            format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd) {
            const credential_definition = {
                '@context': offeredCredential['@context'],
                credentialSubject: offeredCredential.credentialSubject,
                types: offeredCredential.types,
            };
            return { type, format, locations, credential_definition };
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc) {
            return {
                type,
                format,
                locations,
                vct: offeredCredential.vct,
                claims: offeredCredential.claims,
            };
        }
        else {
            throw new core_1.CredoError(`Cannot create authorization_details. Unsupported credential format '${format}'.`);
        }
    }
    async resolveAuthorizationRequest(agentContext, resolvedCredentialOffer, authCodeFlowOptions) {
        const { metadata, offeredCredentials } = resolvedCredentialOffer;
        const codeVerifier = (await Promise.all([agentContext.wallet.generateNonce(), agentContext.wallet.generateNonce()])).join('');
        const codeVerifierSha256 = core_1.Hasher.hash(codeVerifier, 'sha-256');
        const codeChallenge = core_1.TypedArrayEncoder.toBase64URL(codeVerifierSha256);
        this.logger.debug('Converted code_verifier to code_challenge', {
            codeVerifier: codeVerifier,
            sha256: codeVerifierSha256.toString(),
            base64Url: codeChallenge,
        });
        const authDetailsLocation = metadata.credentialIssuerMetadata.authorization_server
            ? metadata.credentialIssuerMetadata.authorization_server
            : undefined;
        const authDetails = offeredCredentials
            .map((credential) => this.getAuthDetailsFromOfferedCredential(credential, authDetailsLocation))
            .filter((authDetail) => authDetail !== undefined);
        const { clientId, redirectUri, scope, customHeaders } = authCodeFlowOptions;
        const vciClientState = {
            state: {
                credentialOffer: resolvedCredentialOffer.credentialOfferRequestWithBaseUrl,
                clientId,
                credentialIssuer: metadata.issuer,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                endpointMetadata: metadata, // will be v11 / v13 based on version
                pkce: {
                    codeChallenge,
                    codeChallengeMethod: oid4vci_common_1.CodeChallengeMethod.S256,
                    codeVerifier,
                },
            },
            headers: customHeaders
        };
        const client = resolvedCredentialOffer.version === oid4vci_common_1.OpenId4VCIVersion.VER_1_0_11
            ? await oid4vci_client_1.OpenID4VCIClientV1_0_11.fromState(vciClientState)
            : await oid4vci_client_1.OpenID4VCIClientV1_0_13.fromState(vciClientState);
        const authorizationRequestUri = await client.createAuthorizationRequestUrl({
            authorizationRequest: {
                redirectUri,
                scope: scope ? scope.join(' ') : undefined,
                authorizationDetails: authDetails,
                parMode: oid4vci_common_1.PARMode.AUTO,
            },
        });
        return Object.assign(Object.assign({}, authCodeFlowOptions), { codeVerifier,
            authorizationRequestUri });
    }
    async sendNotification(options) {
        const { notificationMetadata, notificationEvent } = options;
        const { notificationId, notificationEndpoint } = notificationMetadata;
        const response = await (0, oid4vci_common_1.post)(notificationEndpoint, { notification_id: notificationId, event: notificationEvent }, {
            bearerToken: options.accessToken,
            contentType: 'application/json',
        });
        if (!response.successBody) {
            throw new core_1.CredoError(`Failed to send notification event '${notificationId}' to '${notificationEndpoint}'`);
        }
    }
    async getCreateDpopOptions(agentContext, metadata, resourceRequestOptions) {
        var _a, _b, _c, _d;
        const dpopSigningAlgValuesSupported = (_b = (_a = metadata.authorizationServerMetadata) === null || _a === void 0 ? void 0 : _a.dpop_signing_alg_values_supported) !== null && _b !== void 0 ? _b : metadata.credentialIssuerMetadata.dpop_signing_alg_values_supported;
        if (!dpopSigningAlgValuesSupported)
            return undefined;
        const alg = dpopSigningAlgValuesSupported.find((alg) => (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(alg));
        let jwk;
        let _getCreateJwtCallback = (_c = resourceRequestOptions === null || resourceRequestOptions === void 0 ? void 0 : resourceRequestOptions.getCreateJwtCallback) !== null && _c !== void 0 ? _c : utils_1.getCreateJwtCallback;
        if (resourceRequestOptions) {
            jwk = resourceRequestOptions.jwk;
        }
        else {
            const JwkClass = alg ? (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(alg) : undefined;
            if (!JwkClass) {
                throw new core_1.CredoError(`No supported dpop signature algorithms found in dpop_signing_alg_values_supported '${dpopSigningAlgValuesSupported.join(', ')}'`);
            }
            const key = await agentContext.wallet.createKey({ keyType: JwkClass.keyType });
            jwk = (0, core_1.getJwkFromKey)(key);
        }
        const createDPoPOpts = {
            jwtIssuer: { alg: alg, jwk: jwk.toJson() },
            dPoPSigningAlgValuesSupported: dpopSigningAlgValuesSupported,
            jwtPayloadProps: (_d = resourceRequestOptions === null || resourceRequestOptions === void 0 ? void 0 : resourceRequestOptions.jwtPayloadProps) !== null && _d !== void 0 ? _d : {},
            createJwtCallback: _getCreateJwtCallback(agentContext),
        };
        return createDPoPOpts;
    }
    async requestAccessToken(agentContext, options) {
        var _a, _b, _c, _d;
        const { resolvedCredentialOffer, txCode, resolvedAuthorizationRequest, code, customBody, dPopKeyJwk, getCreateJwtCallback } = options;
        const { metadata, credentialOfferRequestWithBaseUrl } = resolvedCredentialOffer;
        // acquire the access token
        let accessTokenResponse;
        const accessTokenClient = new oid4vci_client_1.AccessTokenClient();
        const createDPoPOpts = await this.getCreateDpopOptions(agentContext, metadata, dPopKeyJwk ? { jwk: dPopKeyJwk, getCreateJwtCallback } : undefined);
        let dpopJwk = dPopKeyJwk;
        if (!dpopJwk && createDPoPOpts) {
            if (!createDPoPOpts.jwtIssuer.jwk.kty) {
                throw new core_1.CredoError('Missing required key type (kty) in the jwk.');
            }
            dpopJwk = (0, core_1.getJwkFromJson)(createDPoPOpts.jwtIssuer.jwk);
        }
        if (resolvedAuthorizationRequest) {
            const { codeVerifier, redirectUri } = resolvedAuthorizationRequest;
            accessTokenResponse = await accessTokenClient.acquireAccessToken({
                metadata: metadata,
                credentialOffer: { credential_offer: credentialOfferRequestWithBaseUrl.credential_offer },
                pin: txCode,
                code,
                codeVerifier,
                redirectUri,
                createDPoPOpts,
            });
        }
        else {
            accessTokenResponse = await accessTokenClient.acquireAccessToken({
                metadata: metadata,
                credentialOffer: { credential_offer: credentialOfferRequestWithBaseUrl.credential_offer },
                pin: txCode,
                createDPoPOpts,
                customBody
            });
        }
        if (!accessTokenResponse.successBody) {
            throw new core_1.CredoError(`could not acquire access token from '${metadata.issuer}'. ${(_a = accessTokenResponse.errorBody) === null || _a === void 0 ? void 0 : _a.error}: ${(_b = accessTokenResponse.errorBody) === null || _b === void 0 ? void 0 : _b.error_description}`);
        }
        this.logger.debug('Requested OpenId4VCI Access Token.');
        return Object.assign(Object.assign({}, accessTokenResponse.successBody), (dpopJwk && { dpop: { jwk: dpopJwk, nonce: (_d = (_c = accessTokenResponse.params) === null || _c === void 0 ? void 0 : _c.dpop) === null || _d === void 0 ? void 0 : _d.dpopNonce } }));
    }
    async acceptCredentialOffer(agentContext, options) {
        var _a, _b, _c, _d, _e, _f;
        const { resolvedCredentialOffer, acceptCredentialOfferOptions, customFormat, additionalProofOfPossessionPayloadClaims, additionalCredentialRequestPayloadClaims, getCreateJwtCallback, popCallback, customBody, skipSdJwtVcValidation } = options;
        const { metadata, version, offeredCredentialConfigurations } = resolvedCredentialOffer;
        const { credentialsToRequest, credentialBindingResolver, verifyCredentialStatus } = acceptCredentialOfferOptions;
        if ((credentialsToRequest === null || credentialsToRequest === void 0 ? void 0 : credentialsToRequest.length) === 0) {
            this.logger.warn(`Accepting 0 credential offers. Returning`);
            return [];
        }
        this.logger.info(`Accepting the following credential offers '${credentialsToRequest ? credentialsToRequest.join(', ') : 'all'}`);
        const supportedJwaSignatureAlgorithms = (0, utils_1.getSupportedJwaSignatureAlgorithms)(agentContext);
        const allowedProofOfPossessionSigAlgs = acceptCredentialOfferOptions.allowedProofOfPossessionSignatureAlgorithms;
        const possibleProofOfPossessionSigAlgs = allowedProofOfPossessionSigAlgs
            ? allowedProofOfPossessionSigAlgs.filter((algorithm) => supportedJwaSignatureAlgorithms.includes(algorithm))
            : supportedJwaSignatureAlgorithms;
        if (possibleProofOfPossessionSigAlgs.length === 0) {
            throw new core_1.CredoError([
                `No possible proof of possession signature algorithm found.`,
                `Signature algorithms supported by the Agent '${supportedJwaSignatureAlgorithms.join(', ')}'`,
                `Allowed Signature algorithms '${allowedProofOfPossessionSigAlgs === null || allowedProofOfPossessionSigAlgs === void 0 ? void 0 : allowedProofOfPossessionSigAlgs.join(', ')}'`,
            ].join('\n'));
        }
        const tokenRequestOptions = {
            resolvedCredentialOffer,
            resolvedAuthorizationRequest: options.resolvedAuthorizationRequestWithCode,
            code: (_a = options.resolvedAuthorizationRequestWithCode) === null || _a === void 0 ? void 0 : _a.code,
            txCode: acceptCredentialOfferOptions.userPin,
        };
        const tokenResponse = options.accessToken
            ? {
                access_token: options.accessToken,
                c_nonce: options.cNonce,
                dpop: options.dpop,
            }
            : await this.requestAccessToken(agentContext, tokenRequestOptions);
        const receivedCredentials = [];
        let newCNonce;
        const credentialConfigurationToRequest = (_b = credentialsToRequest === null || credentialsToRequest === void 0 ? void 0 : credentialsToRequest.map((id) => {
            if (!offeredCredentialConfigurations[id]) {
                const offeredCredentialIds = Object.keys(offeredCredentialConfigurations).join(', ');
                throw new core_1.CredoError(`Credential to request '${id}' is not present in offered credentials. Offered credentials are ${offeredCredentialIds}`);
            }
            return [id, offeredCredentialConfigurations[id]];
        })) !== null && _b !== void 0 ? _b : Object.entries(offeredCredentialConfigurations);
        for (const [offeredCredentialId, offeredCredentialConfiguration] of credentialConfigurationToRequest) {
            // Get all options for the credential request (such as which kid to use, the signature algorithm, etc)
            const { credentialBinding, signatureAlgorithm } = await this.getCredentialRequestOptions(agentContext, {
                possibleProofOfPossessionSignatureAlgorithms: possibleProofOfPossessionSigAlgs,
                offeredCredential: {
                    id: offeredCredentialId,
                    configuration: offeredCredentialConfiguration,
                },
                credentialBindingResolver,
            });
            // Create the proof of possession
            const proofOfPossessionBuilder = oid4vci_client_1.ProofOfPossessionBuilder.fromAccessTokenResponse({
                accessTokenResponse: tokenResponse,
                callbacks: { signCallback: popCallback !== null && popCallback !== void 0 ? popCallback : this.proofOfPossessionSignCallback(agentContext) },
                version,
            })
                .withEndpointMetadata(metadata)
                .withAlg(signatureAlgorithm);
            if (additionalProofOfPossessionPayloadClaims && typeof additionalProofOfPossessionPayloadClaims.iss === 'string') {
                proofOfPossessionBuilder.withIssuer(additionalProofOfPossessionPayloadClaims.iss);
            }
            // TODO: what if auth flow using did, and the did is different from client id. We now use the client_id
            if (credentialBinding.method === 'did') {
                proofOfPossessionBuilder.withClientId((0, core_1.parseDid)(credentialBinding.didUrl).did).withKid(credentialBinding.didUrl);
            }
            else if (credentialBinding.method === 'jwk') {
                proofOfPossessionBuilder.withJWK(credentialBinding.jwk.toJson());
            }
            // Add client id if in auth flow. This may override the clientId from the did binding method. But according to spec,
            // the "value of this claim MUST be the client_id of the Client making the Credential request."
            if (options.clientId || ((_c = options.resolvedAuthorizationRequestWithCode) === null || _c === void 0 ? void 0 : _c.clientId)) {
                proofOfPossessionBuilder.withClientId((options.clientId || ((_d = options.resolvedAuthorizationRequestWithCode) === null || _d === void 0 ? void 0 : _d.clientId)));
            }
            if (newCNonce)
                proofOfPossessionBuilder.withAccessTokenNonce(newCNonce);
            const proofOfPossession = await proofOfPossessionBuilder.build();
            this.logger.debug('Generated JWS', proofOfPossession);
            // Acquire the credential
            const credentialRequestBuilder = oid4vci_client_1.CredentialRequestClientBuilder.fromCredentialOffer({
                credentialOffer: resolvedCredentialOffer.credentialOfferRequestWithBaseUrl,
                metadata: resolvedCredentialOffer.metadata,
            });
            credentialRequestBuilder
                .withVersion(version)
                .withCredentialEndpoint(metadata.credential_endpoint)
                .withToken(tokenResponse.access_token);
            if (customFormat) {
                credentialRequestBuilder.withFormat(customFormat);
            }
            const credentialRequestClient = credentialRequestBuilder.build();
            const createDpopOpts = tokenResponse.dpop
                ? await this.getCreateDpopOptions(agentContext, metadata, {
                    jwk: tokenResponse.dpop.jwk,
                    jwtPayloadProps: { accessToken: tokenResponse.access_token, nonce: (_e = tokenResponse.dpop) === null || _e === void 0 ? void 0 : _e.nonce },
                    getCreateJwtCallback
                })
                : undefined;
            const credentialResponse = await credentialRequestClient.acquireCredentialsUsingProof({
                proofInput: proofOfPossession,
                credentialTypes: (0, issuerMetadataUtils_1.getTypesFromCredentialSupported)(offeredCredentialConfiguration),
                format: offeredCredentialConfiguration.format,
                createDPoPOpts: createDpopOpts,
                customBody,
                additionalRequestClaims: additionalCredentialRequestPayloadClaims
            });
            if (customBody) {
                if (!credentialResponse.successBody) {
                    throw new core_1.CredoError('Did not receive a successBody for credential request with custom body');
                }
                return [credentialResponse.successBody.credential];
            }
            newCNonce = (_f = credentialResponse.successBody) === null || _f === void 0 ? void 0 : _f.c_nonce;
            // Create credential, but we don't store it yet (only after the user has accepted the credential)
            const credential = await this.handleCredentialResponse(agentContext, credentialResponse, {
                verifyCredentialStatus: verifyCredentialStatus !== null && verifyCredentialStatus !== void 0 ? verifyCredentialStatus : false,
                credentialIssuerMetadata: metadata.credentialIssuerMetadata,
                format: customFormat !== null && customFormat !== void 0 ? customFormat : offeredCredentialConfiguration.format,
                skipSdJwtVcValidation
            });
            this.logger.debug('Full credential', credential);
            receivedCredentials.push(credential);
        }
        return receivedCredentials;
    }
    /**
     * Get the options for the credential request. Internally this will resolve the proof of possession
     * requirements, and based on that it will call the proofOfPossessionVerificationMethodResolver to
     * allow the caller to select the correct verification method based on the requirements for the proof
     * of possession.
     */
    async getCredentialRequestOptions(agentContext, options) {
        const { signatureAlgorithm, supportedDidMethods, supportsAllDidMethods, supportsJwk } = this.getProofOfPossessionRequirements(agentContext, {
            credentialToRequest: options.offeredCredential,
            possibleProofOfPossessionSignatureAlgorithms: options.possibleProofOfPossessionSignatureAlgorithms,
        });
        const JwkClass = (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(signatureAlgorithm);
        if (!JwkClass) {
            throw new core_1.CredoError(`Could not determine JWK key type of the JWA signature algorithm '${signatureAlgorithm}'`);
        }
        const supportedVerificationMethods = (0, core_1.getSupportedVerificationMethodTypesFromKeyType)(JwkClass.keyType);
        const format = options.offeredCredential.configuration.format;
        // Now we need to determine how the credential will be bound to us
        const credentialBinding = await options.credentialBindingResolver({
            credentialFormat: format,
            signatureAlgorithm,
            supportedVerificationMethods,
            keyType: JwkClass.keyType,
            supportedCredentialId: options.offeredCredential.id,
            supportsAllDidMethods,
            supportedDidMethods,
            supportsJwk,
        });
        // Make sure the issuer of proof of possession is valid according to openid issuer metadata
        if (credentialBinding.method === 'did' &&
            !supportsAllDidMethods &&
            // If supportedDidMethods is undefined, it means the issuer didn't include the binding methods in the metadata
            // The user can still select a verification method, but we can't validate it
            supportedDidMethods !== undefined &&
            !supportedDidMethods.find((supportedDidMethod) => credentialBinding.didUrl.startsWith(supportedDidMethod))) {
            const { method } = (0, core_1.parseDid)(credentialBinding.didUrl);
            const supportedDidMethodsString = supportedDidMethods.join(', ');
            throw new core_1.CredoError(`Resolved credential binding for proof of possession uses did method '${method}', but issuer only supports '${supportedDidMethodsString}'`);
        }
        else if (credentialBinding.method === 'jwk' && !supportsJwk) {
            throw new core_1.CredoError(`Resolved credential binding for proof of possession uses jwk, but openid issuer does not support 'jwk' or 'cose_key' cryptographic binding method`);
        }
        // FIXME: we don't have the verification method here
        // Make sure the verification method uses a supported verification method type
        // if (!supportedVerificationMethods.includes(verificationMethod.type)) {
        //   const supportedVerificationMethodsString = supportedVerificationMethods.join(', ')
        //   throw new CredoError(
        //     `Verification method uses verification method type '${verificationMethod.type}', but only '${supportedVerificationMethodsString}' verification methods are supported for key type '${JwkClass.keyType}'`
        //   )
        // }
        return { credentialBinding, signatureAlgorithm };
    }
    /**
     * Get the requirements for creating the proof of possession. Based on the allowed
     * credential formats, the allowed proof of possession signature algorithms, and the
     * credential type, this method will select the best credential format and signature
     * algorithm to use, based on the order of preference.
     */
    getProofOfPossessionRequirements(agentContext, options) {
        var _a, _b, _c, _d, _e, _f;
        const { credentialToRequest } = options;
        if (!OpenId4VciHolderServiceOptions_1.openId4VciSupportedCredentialFormats.includes(credentialToRequest.configuration.format)) {
            throw new core_1.CredoError([
                `Requested credential with format '${credentialToRequest.configuration.format}',`,
                `for the credential with id '${credentialToRequest.id},`,
                `but the wallet only supports the following formats '${OpenId4VciHolderServiceOptions_1.openId4VciSupportedCredentialFormats.join(', ')}'`,
            ].join('\n'));
        }
        // For each of the supported algs, find the key types, then find the proof types
        const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
        let signatureAlgorithm;
        if (credentialToRequest.configuration.proof_types_supported) {
            if (!credentialToRequest.configuration.proof_types_supported.jwt) {
                throw new core_1.CredoError(`Unsupported proof type(s) ${Object.keys(credentialToRequest.configuration.proof_types_supported).join(', ')}. Supported proof type(s) are: jwt`);
            }
        }
        const proofSigningAlgsSupported = (_b = (_a = credentialToRequest.configuration.proof_types_supported) === null || _a === void 0 ? void 0 : _a.jwt) === null || _b === void 0 ? void 0 : _b.proof_signing_alg_values_supported;
        // If undefined, it means the issuer didn't include the cryptographic suites in the metadata
        // We just guess that the first one is supported
        if (proofSigningAlgsSupported === undefined) {
            signatureAlgorithm = options.possibleProofOfPossessionSignatureAlgorithms[0];
        }
        else {
            switch (credentialToRequest.configuration.format) {
                case shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson:
                case shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd:
                case shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc:
                    signatureAlgorithm = options.possibleProofOfPossessionSignatureAlgorithms.find((signatureAlgorithm) => proofSigningAlgsSupported.includes(signatureAlgorithm));
                    break;
                case shared_1.OpenId4VciCredentialFormatProfile.LdpVc:
                    signatureAlgorithm = options.possibleProofOfPossessionSignatureAlgorithms.find((signatureAlgorithm) => {
                        const JwkClass = (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(signatureAlgorithm);
                        if (!JwkClass)
                            return false;
                        const matchingSuite = signatureSuiteRegistry.getAllByKeyType(JwkClass.keyType);
                        if (matchingSuite.length === 0)
                            return false;
                        return proofSigningAlgsSupported.includes(matchingSuite[0].proofType);
                    });
                    break;
                default:
                    throw new core_1.CredoError(`Unsupported credential format.`);
            }
        }
        if (!signatureAlgorithm) {
            throw new core_1.CredoError(`Could not establish signature algorithm for format ${credentialToRequest.configuration.format} and id ${credentialToRequest.id}`);
        }
        const issuerSupportedBindingMethods = credentialToRequest.configuration.cryptographic_binding_methods_supported;
        const supportsAllDidMethods = (_c = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('did')) !== null && _c !== void 0 ? _c : false;
        const supportedDidMethods = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.filter((method) => method.startsWith('did:'));
        // The cryptographic_binding_methods_supported describe the cryptographic key material that the issued Credential is bound to.
        const supportsCoseKey = (_d = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('cose_key')) !== null && _d !== void 0 ? _d : false;
        const supportsJwk = (_f = (_e = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('jwk')) !== null && _e !== void 0 ? _e : supportsCoseKey) !== null && _f !== void 0 ? _f : false;
        return {
            signatureAlgorithm,
            supportedDidMethods,
            supportsAllDidMethods,
            supportsJwk,
        };
    }
    async handleCredentialResponse(agentContext, credentialResponse, options) {
        var _a, _b, _c, _d, _e, _f;
        const { verifyCredentialStatus, credentialIssuerMetadata } = options;
        this.logger.debug('Credential request response', credentialResponse);
        if (!credentialResponse.successBody || !credentialResponse.successBody.credential) {
            throw new core_1.CredoError(`Did not receive a successful credential response. ${(_a = credentialResponse.errorBody) === null || _a === void 0 ? void 0 : _a.error}: ${(_b = credentialResponse.errorBody) === null || _b === void 0 ? void 0 : _b.error_description}`);
        }
        const notificationMetadata = credentialIssuerMetadata.notification_endpoint && credentialResponse.successBody.notification_id
            ? {
                notificationEndpoint: credentialIssuerMetadata.notification_endpoint,
                notificationId: credentialResponse.successBody.notification_id,
            }
            : undefined;
        const format = options.format;
        if (format === shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc) {
            if (typeof credentialResponse.successBody.credential !== 'string')
                throw new core_1.CredoError(`Received a credential of format ${shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc}, but the credential is not a string. ${JSON.stringify(credentialResponse.successBody.credential)}`);
            const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
            if (options.skipSdJwtVcValidation) {
                return { credential: sdJwtVcApi.fromCompact(credentialResponse.successBody.credential), notificationMetadata };
            }
            else {
                const verificationResult = await sdJwtVcApi.verify({
                    compactSdJwtVc: credentialResponse.successBody.credential,
                });
                if (!verificationResult.isValid) {
                    agentContext.config.logger.error('Failed to validate credential', { verificationResult });
                    throw new core_1.CredoError(`Failed to validate sd-jwt-vc credential. Results = ${JSON.stringify(verificationResult)}`);
                }
                return { credential: verificationResult.sdJwtVc, notificationMetadata };
            }
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson ||
            format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd) {
            const credential = core_1.W3cJwtVerifiableCredential.fromSerializedJwt(credentialResponse.successBody.credential);
            const result = await this.w3cCredentialService.verifyCredential(agentContext, {
                credential,
                verifyCredentialStatus,
            });
            if (!result.isValid) {
                agentContext.config.logger.error('Failed to validate credential', { result });
                throw new core_1.CredoError(`Failed to validate credential, error = ${(_d = (_c = result.error) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : 'Unknown'}`);
            }
            return { credential, notificationMetadata };
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.LdpVc) {
            const credential = core_1.W3cJsonLdVerifiableCredential.fromJson(credentialResponse.successBody.credential);
            const result = await this.w3cCredentialService.verifyCredential(agentContext, {
                credential,
                verifyCredentialStatus,
            });
            if (!result.isValid) {
                agentContext.config.logger.error('Failed to validate credential', { result });
                throw new core_1.CredoError(`Failed to validate credential, error = ${(_f = (_e = result.error) === null || _e === void 0 ? void 0 : _e.message) !== null && _f !== void 0 ? _f : 'Unknown'}`);
            }
            return { credential, notificationMetadata };
        }
        throw new core_1.CredoError(`Unsupported credential format ${credentialResponse.successBody.format}`);
    }
    proofOfPossessionSignCallback(agentContext) {
        return async (jwt, kid) => {
            if (!jwt.header)
                throw new core_1.CredoError('No header present on JWT');
            if (!jwt.payload)
                throw new core_1.CredoError('No payload present on JWT');
            if (kid && jwt.header.jwk) {
                throw new core_1.CredoError('Both KID and JWK are present in the callback. Only one can be present');
            }
            let key;
            if (kid) {
                if (!kid.startsWith('did:')) {
                    throw new core_1.CredoError(`kid '${kid}' is not a DID. Only dids are supported for kid`);
                }
                else if (!kid.includes('#')) {
                    throw new core_1.CredoError(`kid '${kid}' does not contain a fragment. kid MUST point to a specific key in the did document.`);
                }
                const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
                const didDocument = await didsApi.resolveDidDocument(kid);
                const verificationMethod = didDocument.dereferenceKey(kid, ['authentication']);
                key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
            }
            else if (jwt.header.jwk) {
                key = (0, core_1.getJwkFromJson)(jwt.header.jwk).key;
            }
            else {
                throw new core_1.CredoError('No KID or JWK is present in the callback');
            }
            const jwk = (0, core_1.getJwkFromKey)(key);
            if (!jwk.supportsSignatureAlgorithm(jwt.header.alg)) {
                throw new core_1.CredoError(`key type '${jwk.keyType}', does not support the JWS signature alg '${jwt.header.alg}'`);
            }
            // We don't support these properties, remove them, so we can pass all other header properties to the JWS service
            if (jwt.header.x5c)
                throw new core_1.CredoError('x5c is not supported');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _a = jwt.header, { x5c: _x5c } = _a, supportedHeaderOptions = __rest(_a, ["x5c"]);
            const jws = await this.jwsService.createJwsCompact(agentContext, {
                key,
                payload: core_1.JsonEncoder.toBuffer(jwt.payload),
                protectedHeaderOptions: Object.assign(Object.assign({}, supportedHeaderOptions), { 
                    // only pass jwk if it was present in the header
                    jwk: jwt.header.jwk ? jwk : undefined }),
            });
            return jws;
        };
    }
};
exports.OpenId4VciHolderService = OpenId4VciHolderService;
exports.OpenId4VciHolderService = OpenId4VciHolderService = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [Object, core_1.W3cCredentialService,
        core_1.JwsService])
], OpenId4VciHolderService);
//# sourceMappingURL=OpenId4VciHolderService.js.map