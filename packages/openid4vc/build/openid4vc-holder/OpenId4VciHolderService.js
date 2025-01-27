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
exports.OpenId4VciHolderService = void 0;
const oauth2_1 = require("@animo-id/oauth2");
const oid4vci_1 = require("@animo-id/oid4vci");
const core_1 = require("@credo-ts/core");
const shared_1 = require("../shared");
const callbacks_1 = require("../shared/callbacks");
const issuerMetadataUtils_1 = require("../shared/issuerMetadataUtils");
const utils_1 = require("../shared/utils");
const OpenId4VciHolderServiceOptions_1 = require("./OpenId4VciHolderServiceOptions");
let OpenId4VciHolderService = class OpenId4VciHolderService {
    constructor(logger, w3cCredentialService, jwsService) {
        this.w3cCredentialService = w3cCredentialService;
        this.jwsService = jwsService;
        this.logger = logger;
    }
    async resolveIssuerMetadata(agentContext, credentialIssuer) {
        const client = this.getClient(agentContext);
        const metadata = await client.resolveIssuerMetadata(credentialIssuer);
        this.logger.debug('fetched credential issuer metadata', { metadata });
        return metadata;
    }
    async resolveCredentialOffer(agentContext, credentialOffer) {
        const client = this.getClient(agentContext);
        const credentialOfferObject = await client.resolveCredentialOffer(credentialOffer);
        const metadata = await client.resolveIssuerMetadata(credentialOfferObject.credential_issuer);
        this.logger.debug('fetched credential offer and issuer metadata', { metadata, credentialOfferObject });
        const credentialConfigurationsSupported = (0, issuerMetadataUtils_1.getOfferedCredentials)(credentialOfferObject.credential_configuration_ids, client.getKnownCredentialConfigurationsSupported(metadata.credentialIssuer), 
        // We only filter for known configurations, so it's ok if not found
        { ignoreNotFoundIds: true });
        return {
            metadata,
            offeredCredentialConfigurations: credentialConfigurationsSupported,
            credentialOfferPayload: credentialOfferObject,
        };
    }
    async resolveAuthorizationRequest(agentContext, resolvedCredentialOffer, authCodeFlowOptions) {
        var _a, _b;
        const { clientId, redirectUri } = authCodeFlowOptions;
        const { metadata, credentialOfferPayload, offeredCredentialConfigurations } = resolvedCredentialOffer;
        const client = this.getClient(agentContext);
        // If scope is not provided, we request scope for all offered credentials
        const scope = (_a = authCodeFlowOptions.scope) !== null && _a !== void 0 ? _a : (0, issuerMetadataUtils_1.getScopesFromCredentialConfigurationsSupported)(offeredCredentialConfigurations);
        const authorizationResult = await client.initiateAuthorization({
            clientId,
            issuerMetadata: metadata,
            credentialOffer: credentialOfferPayload,
            scope: scope.join(' '),
            redirectUri,
        });
        if (authorizationResult.authorizationFlow === oid4vci_1.AuthorizationFlow.PresentationDuringIssuance) {
            return {
                authorizationFlow: oid4vci_1.AuthorizationFlow.PresentationDuringIssuance,
                oid4vpRequestUrl: authorizationResult.oid4vpRequestUrl,
                authSession: authorizationResult.authSession,
            };
        }
        // Normal Oauth2Redirect flow
        return {
            authorizationFlow: oid4vci_1.AuthorizationFlow.Oauth2Redirect,
            codeVerifier: (_b = authorizationResult.pkce) === null || _b === void 0 ? void 0 : _b.codeVerifier,
            authorizationRequestUrl: authorizationResult.authorizationRequestUrl,
        };
    }
    async sendNotification(agentContext, options) {
        const client = this.getClient(agentContext);
        await client.sendNotification({
            accessToken: options.accessToken,
            dpop: options.dpop
                ? await this.getDpopOptions(agentContext, Object.assign(Object.assign({}, options.dpop), { dpopSigningAlgValuesSupported: [options.dpop.alg] }))
                : undefined,
            issuerMetadata: options.metadata,
            notification: {
                event: options.notificationEvent,
                notificationId: options.notificationId,
            },
        });
    }
    async getDpopOptions(agentContext, { jwk, dpopSigningAlgValuesSupported, nonce, }) {
        if (jwk) {
            const alg = dpopSigningAlgValuesSupported.find((alg) => jwk.supportedSignatureAlgorithms.includes(alg));
            if (!alg) {
                throw new core_1.CredoError(`No supported dpop signature algorithms found in dpop_signing_alg_values_supported '${dpopSigningAlgValuesSupported.join(', ')}' matching key type ${jwk.keyType}`);
            }
            return {
                signer: {
                    method: 'jwk',
                    alg,
                    publicJwk: jwk.toJson(),
                },
                nonce,
            };
        }
        const alg = dpopSigningAlgValuesSupported.find((alg) => (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(alg));
        const JwkClass = alg ? (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(alg) : undefined;
        if (!alg || !JwkClass) {
            throw new core_1.CredoError(`No supported dpop signature algorithms found in dpop_signing_alg_values_supported '${dpopSigningAlgValuesSupported.join(', ')}'`);
        }
        const key = await agentContext.wallet.createKey({ keyType: JwkClass.keyType });
        return {
            signer: {
                method: 'jwk',
                alg,
                publicJwk: (0, core_1.getJwkFromKey)(key).toJson(),
            },
            nonce,
        };
    }
    async retrieveAuthorizationCodeUsingPresentation(agentContext, options) {
        const client = this.getClient(agentContext);
        // TODO: support dpop on this endpoint as well
        // const dpop = options.dpop
        //   ? await this.getDpopOptions(agentContext, {
        //       ...options.dpop,
        //       dpopSigningAlgValuesSupported: [options.dpop.alg],
        //     })
        //   : undefined
        // TODO: we should support DPoP in this request as well
        const { authorizationChallengeResponse } = await client.retrieveAuthorizationCodeUsingPresentation({
            authSession: options.authSession,
            presentationDuringIssuanceSession: options.presentationDuringIssuanceSession,
            credentialOffer: options.resolvedCredentialOffer.credentialOfferPayload,
            issuerMetadata: options.resolvedCredentialOffer.metadata,
            // dpop
        });
        return {
            authorizationCode: authorizationChallengeResponse.authorization_code,
        };
    }
    async requestAccessToken(agentContext, options) {
        var _a, _b, _c, _d;
        const { metadata, credentialOfferPayload } = options.resolvedCredentialOffer;
        const client = this.getClient(agentContext);
        const oauth2Client = this.getOauth2Client(agentContext);
        const authorizationServer = options.code
            ? (_b = (_a = credentialOfferPayload.grants) === null || _a === void 0 ? void 0 : _a.authorization_code) === null || _b === void 0 ? void 0 : _b.authorization_server
            : (_d = (_c = credentialOfferPayload.grants) === null || _c === void 0 ? void 0 : _c[oauth2_1.preAuthorizedCodeGrantIdentifier]) === null || _d === void 0 ? void 0 : _d.authorization_server;
        const authorizationServerMetadata = (0, oauth2_1.getAuthorizationServerMetadataFromList)(metadata.authorizationServers, authorizationServer !== null && authorizationServer !== void 0 ? authorizationServer : metadata.authorizationServers[0].issuer);
        // TODO: should allow dpop input parameter for if it was already bound earlier
        const isDpopSupported = oauth2Client.isDpopSupported({
            authorizationServerMetadata,
        });
        const dpop = isDpopSupported.supported
            ? await this.getDpopOptions(agentContext, {
                dpopSigningAlgValuesSupported: isDpopSupported.dpopSigningAlgValuesSupported,
            })
            : undefined;
        const result = options.code
            ? await client.retrieveAuthorizationCodeAccessTokenFromOffer({
                issuerMetadata: metadata,
                credentialOffer: credentialOfferPayload,
                authorizationCode: options.code,
                dpop,
                pkceCodeVerifier: options.codeVerifier,
                redirectUri: options.redirectUri,
                additionalRequestPayload: {
                    // TODO: handle it as part of client auth once we support
                    // assertion based client authentication
                    client_id: options.clientId,
                },
            })
            : await client.retrievePreAuthorizedCodeAccessTokenFromOffer({
                credentialOffer: credentialOfferPayload,
                issuerMetadata: metadata,
                dpop,
                txCode: options.txCode,
            });
        return Object.assign(Object.assign({}, result), { dpop: dpop
                ? Object.assign(Object.assign({}, result.dpop), { alg: dpop.signer.alg, jwk: (0, core_1.getJwkFromJson)(dpop.signer.publicJwk) }) : undefined });
    }
    async acceptCredentialOffer(agentContext, options) {
        var _a, _b, _c, _d;
        const { resolvedCredentialOffer, acceptCredentialOfferOptions } = options;
        const { metadata, offeredCredentialConfigurations } = resolvedCredentialOffer;
        const { credentialConfigurationIds, credentialBindingResolver, verifyCredentialStatus, requestBatch } = acceptCredentialOfferOptions;
        const client = this.getClient(agentContext);
        if ((credentialConfigurationIds === null || credentialConfigurationIds === void 0 ? void 0 : credentialConfigurationIds.length) === 0) {
            throw new core_1.CredoError(`'credentialConfigurationIds' may not be empty`);
        }
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
        const receivedCredentials = [];
        let cNonce = options.cNonce;
        let dpopNonce = (_a = options.dpop) === null || _a === void 0 ? void 0 : _a.nonce;
        const credentialConfigurationsToRequest = (_b = credentialConfigurationIds === null || credentialConfigurationIds === void 0 ? void 0 : credentialConfigurationIds.map((id) => {
            if (!offeredCredentialConfigurations[id]) {
                const offeredCredentialIds = Object.keys(offeredCredentialConfigurations).join(', ');
                throw new core_1.CredoError(`Credential to request '${id}' is not present in offered credentials. Offered credentials are ${offeredCredentialIds}`);
            }
            return [id, offeredCredentialConfigurations[id]];
        })) !== null && _b !== void 0 ? _b : Object.entries(offeredCredentialConfigurations);
        // If we don't have a nonce yet, we need to first get one
        if (!cNonce) {
            // Best option is to use nonce endpoint (draft 14+)
            if (!metadata.credentialIssuer.nonce_endpoint) {
                const nonceResponse = await client.requestNonce({ issuerMetadata: metadata });
                cNonce = nonceResponse.c_nonce;
            }
            else {
                // Otherwise we will send a dummy request
                await client
                    .retrieveCredentials({
                    issuerMetadata: metadata,
                    accessToken: options.accessToken,
                    credentialConfigurationId: credentialConfigurationsToRequest[0][0],
                    dpop: options.dpop
                        ? await this.getDpopOptions(agentContext, Object.assign(Object.assign({}, options.dpop), { nonce: dpopNonce, dpopSigningAlgValuesSupported: [options.dpop.alg] }))
                        : undefined,
                })
                    .catch((e) => {
                    var _a;
                    if (e instanceof oid4vci_1.Oid4vciRetrieveCredentialsError && ((_a = e.response.credentialErrorResponseResult) === null || _a === void 0 ? void 0 : _a.success)) {
                        cNonce = e.response.credentialErrorResponseResult.output.c_nonce;
                    }
                });
            }
        }
        if (!cNonce) {
            throw new core_1.CredoError('No cNonce provided and unable to acquire cNonce from the credential issuer');
        }
        // If true: use max from issuer or otherwise 1
        // If number not 0: use the number
        // Else: use 1
        const batchSize = requestBatch === true ? (_d = (_c = metadata.credentialIssuer.batch_credential_issuance) === null || _c === void 0 ? void 0 : _c.batch_size) !== null && _d !== void 0 ? _d : 1 : requestBatch || 1;
        if (typeof requestBatch === 'number' && requestBatch > 1 && !metadata.credentialIssuer.batch_credential_issuance) {
            throw new core_1.CredoError(`Credential issuer '${metadata.credentialIssuer.credential_issuer}' does not support batch credential issuance using the 'proofs' request property. Onlt 'proof' supported.`);
        }
        for (const [offeredCredentialId, offeredCredentialConfiguration] of credentialConfigurationsToRequest) {
            const jwts = [];
            for (let i = 0; i < batchSize; i++) {
                // TODO: we should call this method once with a keyLength. Gives more control to the user and better aligns with key attestations
                // Get a key instance for each entry in the batch.
                // Get all options for the credential request (such as which kid to use, the signature algorithm, etc)
                const { jwtSigner } = await this.getCredentialRequestOptions(agentContext, {
                    possibleProofOfPossessionSignatureAlgorithms: possibleProofOfPossessionSigAlgs,
                    offeredCredential: {
                        id: offeredCredentialId,
                        configuration: offeredCredentialConfiguration,
                    },
                    credentialBindingResolver,
                });
                const { jwt } = await client.createCredentialRequestJwtProof({
                    credentialConfigurationId: offeredCredentialId,
                    issuerMetadata: resolvedCredentialOffer.metadata,
                    signer: jwtSigner,
                    clientId: options.clientId,
                    nonce: cNonce,
                });
                this.logger.debug('Generated credential request proof of possesion jwt', { jwt });
                jwts.push(jwt);
            }
            const { credentialResponse, dpop } = await client.retrieveCredentials({
                issuerMetadata: metadata,
                accessToken: options.accessToken,
                credentialConfigurationId: offeredCredentialId,
                dpop: options.dpop
                    ? await this.getDpopOptions(agentContext, Object.assign(Object.assign({}, options.dpop), { nonce: dpopNonce, dpopSigningAlgValuesSupported: [options.dpop.alg] }))
                    : undefined,
                proofs: batchSize > 1 ? { jwt: jwts } : undefined,
                proof: batchSize === 1
                    ? {
                        proof_type: 'jwt',
                        jwt: jwts[0],
                    }
                    : undefined,
            });
            // Set new nonce values
            cNonce = credentialResponse.c_nonce;
            dpopNonce = dpop === null || dpop === void 0 ? void 0 : dpop.nonce;
            // Create credential, but we don't store it yet (only after the user has accepted the credential)
            const credential = await this.handleCredentialResponse(agentContext, credentialResponse, {
                verifyCredentialStatus: verifyCredentialStatus !== null && verifyCredentialStatus !== void 0 ? verifyCredentialStatus : false,
                credentialIssuerMetadata: metadata.credentialIssuer,
                format: offeredCredentialConfiguration.format,
                credentialConfigurationId: offeredCredentialId,
            });
            this.logger.debug('received credential', credential.credentials.map((c) => c instanceof core_1.Mdoc ? { issuerSignedNamespaces: c.issuerSignedNamespaces, base64Url: c.base64Url } : c));
            receivedCredentials.push(Object.assign(Object.assign({}, credential), { credentialConfigurationId: offeredCredentialId }));
        }
        return {
            credentials: receivedCredentials,
            dpop: options.dpop
                ? Object.assign(Object.assign({}, options.dpop), { nonce: dpopNonce }) : undefined,
            cNonce,
        };
    }
    /**
     * Get the options for the credential request. Internally this will resolve the proof of possession
     * requirements, and based on that it will call the proofOfPossessionVerificationMethodResolver to
     * allow the caller to select the correct verification method based on the requirements for the proof
     * of possession.
     */
    async getCredentialRequestOptions(agentContext, options) {
        const { signatureAlgorithms, supportedDidMethods, supportsAllDidMethods, supportsJwk } = this.getProofOfPossessionRequirements(agentContext, {
            credentialToRequest: options.offeredCredential,
            possibleProofOfPossessionSignatureAlgorithms: options.possibleProofOfPossessionSignatureAlgorithms,
        });
        const JwkClasses = signatureAlgorithms.map((signatureAlgorithm) => {
            const JwkClass = (0, core_1.getJwkClassFromJwaSignatureAlgorithm)(signatureAlgorithm);
            if (!JwkClass) {
                throw new core_1.CredoError(`Could not determine JWK key type of the JWA signature algorithm '${signatureAlgorithm}'`);
            }
            return JwkClass;
        });
        const keyTypes = JwkClasses.map((JwkClass) => JwkClass.keyType);
        const supportedVerificationMethods = keyTypes.flatMap((keyType) => (0, core_1.getSupportedVerificationMethodTypesFromKeyType)(keyType));
        const format = options.offeredCredential.configuration.format;
        const supportsAnyMethod = supportedDidMethods !== undefined || supportsAllDidMethods || supportsJwk;
        // Now we need to determine how the credential will be bound to us
        const credentialBinding = await options.credentialBindingResolver({
            agentContext,
            credentialFormat: format,
            signatureAlgorithms,
            supportedVerificationMethods,
            keyTypes: JwkClasses.map((JwkClass) => JwkClass.keyType),
            credentialConfigurationId: options.offeredCredential.id,
            supportsAllDidMethods,
            supportedDidMethods,
            supportsJwk,
        });
        let jwk;
        // Make sure the issuer of proof of possession is valid according to openid issuer metadata
        if (credentialBinding.method === 'did') {
            // Test binding method
            if (!supportsAllDidMethods &&
                // If supportedDidMethods is undefined, it means the issuer didn't include the binding methods in the metadata
                // The user can still select a verification method, but we can't validate it
                supportedDidMethods !== undefined &&
                !supportedDidMethods.find((supportedDidMethod) => credentialBinding.didUrl.startsWith(supportedDidMethod) && supportsAnyMethod)) {
                const { method } = (0, core_1.parseDid)(credentialBinding.didUrl);
                const supportedDidMethodsString = supportedDidMethods.join(', ');
                throw new core_1.CredoError(`Resolved credential binding for proof of possession uses did method '${method}', but issuer only supports '${supportedDidMethodsString}'`);
            }
            const key = await (0, utils_1.getKeyFromDid)(agentContext, credentialBinding.didUrl);
            jwk = (0, core_1.getJwkFromKey)(key);
            if (!keyTypes.includes(key.keyType)) {
                throw new core_1.CredoError(`Credential binding returned did url that points to key with type '${key.keyType}', but one of '${keyTypes.join(', ')}' was expected`);
            }
        }
        else if (credentialBinding.method === 'jwk') {
            if (!supportsJwk && supportsAnyMethod) {
                throw new core_1.CredoError(`Resolved credential binding for proof of possession uses jwk, but openid issuer does not support 'jwk' or 'cose_key' cryptographic binding method`);
            }
            jwk = credentialBinding.jwk;
            if (!keyTypes.includes(credentialBinding.jwk.key.keyType)) {
                throw new core_1.CredoError(`Credential binding returned jwk with key with type '${credentialBinding.jwk.key.keyType}', but one of '${keyTypes.join(', ')}' was expected`);
            }
        }
        else {
            // @ts-expect-error currently if/else if exhaustive, but once we add new option it will give ts error
            throw new core_1.CredoError(`Unsupported credential binding method ${credentialBinding.method}`);
        }
        const alg = jwk.supportedSignatureAlgorithms.find((alg) => signatureAlgorithms.includes(alg));
        if (!alg) {
            // Should not happen, to make ts happy
            throw new core_1.CredoError(`Unable to determine alg for key type ${jwk.keyType}`);
        }
        const jwtSigner = credentialBinding.method === 'did'
            ? {
                method: credentialBinding.method,
                didUrl: credentialBinding.didUrl,
                alg,
            }
            : {
                method: 'jwk',
                publicJwk: credentialBinding.jwk.toJson(),
                alg,
            };
        return { credentialBinding, signatureAlgorithm: alg, jwtSigner };
    }
    /**
     * Get the requirements for creating the proof of possession. Based on the allowed
     * credential formats, the allowed proof of possession signature algorithms, and the
     * credential type, this method will select the best credential format and signature
     * algorithm to use, based on the order of preference.
     */
    getProofOfPossessionRequirements(agentContext, options) {
        var _a, _b, _c, _d, _e;
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
        let signatureAlgorithms = [];
        if (credentialToRequest.configuration.proof_types_supported) {
            if (!credentialToRequest.configuration.proof_types_supported.jwt) {
                throw new core_1.CredoError(`Unsupported proof type(s) ${Object.keys(credentialToRequest.configuration.proof_types_supported).join(', ')}. Supported proof type(s) are: jwt`);
            }
        }
        const proofSigningAlgsSupported = (_b = (_a = credentialToRequest.configuration.proof_types_supported) === null || _a === void 0 ? void 0 : _a.jwt) === null || _b === void 0 ? void 0 : _b.proof_signing_alg_values_supported;
        // If undefined, it means the issuer didn't include the cryptographic suites in the metadata
        // We just guess that the first one is supported
        if (proofSigningAlgsSupported === undefined) {
            signatureAlgorithms = options.possibleProofOfPossessionSignatureAlgorithms;
        }
        else {
            switch (credentialToRequest.configuration.format) {
                case shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson:
                case shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd:
                case shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc:
                case shared_1.OpenId4VciCredentialFormatProfile.MsoMdoc:
                    signatureAlgorithms = options.possibleProofOfPossessionSignatureAlgorithms.filter((signatureAlgorithm) => proofSigningAlgsSupported.includes(signatureAlgorithm));
                    break;
                case shared_1.OpenId4VciCredentialFormatProfile.LdpVc:
                    signatureAlgorithms = options.possibleProofOfPossessionSignatureAlgorithms.filter((signatureAlgorithm) => {
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
        if (signatureAlgorithms.length === 0) {
            throw new core_1.CredoError(`Could not establish signature algorithm for format ${credentialToRequest.configuration.format} and id ${credentialToRequest.id}. Server supported signature algorithms are '${(_c = proofSigningAlgsSupported === null || proofSigningAlgsSupported === void 0 ? void 0 : proofSigningAlgsSupported.join(', ')) !== null && _c !== void 0 ? _c : 'Not defined'}', available are '${options.possibleProofOfPossessionSignatureAlgorithms.join(', ')}'`);
        }
        const issuerSupportedBindingMethods = credentialToRequest.configuration.cryptographic_binding_methods_supported;
        const supportsAllDidMethods = (_d = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('did')) !== null && _d !== void 0 ? _d : false;
        const supportedDidMethods = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.filter((method) => method.startsWith('did:'));
        // The cryptographic_binding_methods_supported describe the cryptographic key material that the issued Credential is bound to.
        const supportsCoseKey = (_e = issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('cose_key')) !== null && _e !== void 0 ? _e : false;
        const supportsJwk = (issuerSupportedBindingMethods === null || issuerSupportedBindingMethods === void 0 ? void 0 : issuerSupportedBindingMethods.includes('jwk')) || supportsCoseKey;
        return {
            signatureAlgorithms,
            supportedDidMethods,
            supportsAllDidMethods,
            supportsJwk,
        };
    }
    async handleCredentialResponse(agentContext, credentialResponse, options) {
        var _a;
        const { verifyCredentialStatus, credentialConfigurationId } = options;
        this.logger.debug('Credential response', credentialResponse);
        const credentials = (_a = credentialResponse.credentials) !== null && _a !== void 0 ? _a : (credentialResponse.credential ? [credentialResponse.credential] : undefined);
        if (!credentials) {
            throw new core_1.CredoError(`Credential response returned neither 'credentials' nor 'credential' parameter.`);
        }
        const notificationId = credentialResponse.notification_id;
        const format = options.format;
        if (format === shared_1.OpenId4VciCredentialFormatProfile.SdJwtVc) {
            if (!credentials.every((c) => typeof c === 'string')) {
                throw new core_1.CredoError(`Received credential(s) of format ${format}, but not all credential(s) are a string. ${JSON.stringify(credentials)}`);
            }
            const sdJwtVcApi = agentContext.dependencyManager.resolve(core_1.SdJwtVcApi);
            const verificationResults = await Promise.all(credentials.map((compactSdJwtVc, index) => sdJwtVcApi.verify({
                compactSdJwtVc,
                // Only load and verify it for the first instance
                fetchTypeMetadata: index === 0,
            })));
            if (!verificationResults.every((result) => result.isValid)) {
                agentContext.config.logger.error('Failed to validate credential(s)', { verificationResults });
                throw new core_1.CredoError(`Failed to validate sd-jwt-vc credentials. Results = ${JSON.stringify(verificationResults)}`);
            }
            return {
                credentials: verificationResults.map((result) => result.sdJwtVc),
                notificationId,
                credentialConfigurationId,
            };
        }
        else if (options.format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJson ||
            options.format === shared_1.OpenId4VciCredentialFormatProfile.JwtVcJsonLd) {
            if (!credentials.every((c) => typeof c === 'string')) {
                throw new core_1.CredoError(`Received credential(s) of format ${format}, but not all credential(s) are a string. ${JSON.stringify(credentials)}`);
            }
            const result = await Promise.all(credentials.map(async (c) => {
                const credential = core_1.W3cJwtVerifiableCredential.fromSerializedJwt(c);
                const result = await this.w3cCredentialService.verifyCredential(agentContext, {
                    credential,
                    verifyCredentialStatus,
                });
                return { credential, result };
            }));
            if (!result.every((c) => c.result.isValid)) {
                agentContext.config.logger.error('Failed to validate credentials', { result });
                throw new core_1.CredoError(`Failed to validate credential, error = ${result
                    .map((e) => { var _a; return (_a = e.result.error) === null || _a === void 0 ? void 0 : _a.message; })
                    .filter(Boolean)
                    .join(', ')}`);
            }
            return { credentials: result.map((r) => r.credential), notificationId, credentialConfigurationId };
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.LdpVc) {
            if (!credentials.every((c) => typeof c === 'object')) {
                throw new core_1.CredoError(`Received credential(s) of format ${format}, but not all credential(s) are an object. ${JSON.stringify(credentials)}`);
            }
            const result = await Promise.all(credentials.map(async (c) => {
                const credential = core_1.W3cJsonLdVerifiableCredential.fromJson(c);
                const result = await this.w3cCredentialService.verifyCredential(agentContext, {
                    credential,
                    verifyCredentialStatus,
                });
                return { credential, result };
            }));
            if (!result.every((c) => c.result.isValid)) {
                agentContext.config.logger.error('Failed to validate credentials', { result });
                throw new core_1.CredoError(`Failed to validate credential, error = ${result
                    .map((e) => { var _a; return (_a = e.result.error) === null || _a === void 0 ? void 0 : _a.message; })
                    .filter(Boolean)
                    .join(', ')}`);
            }
            return { credentials: result.map((r) => r.credential), notificationId, credentialConfigurationId };
        }
        else if (format === shared_1.OpenId4VciCredentialFormatProfile.MsoMdoc) {
            if (!credentials.every((c) => typeof c === 'string')) {
                throw new core_1.CredoError(`Received credential(s) of format ${format}, but not all credential(s) are a string. ${JSON.stringify(credentials)}`);
            }
            const mdocApi = agentContext.dependencyManager.resolve(core_1.MdocApi);
            const result = await Promise.all(credentials.map(async (credential) => {
                const mdoc = core_1.Mdoc.fromBase64Url(credential);
                const result = await mdocApi.verify(mdoc, {});
                return {
                    result,
                    mdoc,
                };
            }));
            if (!result.every((r) => r.result.isValid)) {
                agentContext.config.logger.error('Failed to validate credentials', { result });
                throw new core_1.CredoError(`Failed to validate mdoc credential(s). \n - ${result
                    .map((r, i) => (r.result.isValid ? undefined : `(${i}) ${r.result.error}`))
                    .filter(Boolean)
                    .join('\n - ')}`);
            }
            return { credentials: result.map((c) => c.mdoc), notificationId, credentialConfigurationId };
        }
        throw new core_1.CredoError(`Unsupported credential format ${options.format}`);
    }
    getClient(agentContext) {
        return new oid4vci_1.Oid4vciClient({
            callbacks: (0, callbacks_1.getOid4vciCallbacks)(agentContext),
        });
    }
    getOauth2Client(agentContext) {
        return new oauth2_1.Oauth2Client({
            callbacks: (0, callbacks_1.getOid4vciCallbacks)(agentContext),
        });
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