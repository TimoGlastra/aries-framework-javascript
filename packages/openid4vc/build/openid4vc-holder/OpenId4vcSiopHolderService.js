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
exports.OpenId4VcSiopHolderService = void 0;
const core_1 = require("@credo-ts/core");
const core_2 = require("@openid-federation/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const transform_1 = require("../shared/transform");
const utils_1 = require("../shared/utils");
let OpenId4VcSiopHolderService = class OpenId4VcSiopHolderService {
    constructor(presentationExchangeService, dcqlService) {
        this.presentationExchangeService = presentationExchangeService;
        this.dcqlService = dcqlService;
    }
    async resolveAuthorizationRequest(agentContext, requestJwtOrUri, options = {}) {
        var _a, _b, _c;
        const openidProvider = await this.getOpenIdProvider(agentContext, {
            federation: options.federation,
            trustedCertificates: options.trustedCertificates,
        });
        // parsing happens automatically in verifyAuthorizationRequest
        const verifiedAuthorizationRequest = await openidProvider.verifyAuthorizationRequest(requestJwtOrUri);
        agentContext.config.logger.debug(`verified SIOP Authorization Request for issuer '${verifiedAuthorizationRequest.issuer}'`);
        agentContext.config.logger.debug(`requestJwtOrUri '${requestJwtOrUri}'`);
        if (verifiedAuthorizationRequest.presentationDefinitions &&
            verifiedAuthorizationRequest.presentationDefinitions.length > 1) {
            throw new core_1.CredoError('Only a single presentation definition is supported.');
        }
        const presentationDefinition = (_b = (_a = verifiedAuthorizationRequest.presentationDefinitions) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.definition;
        const dcqlQuery = verifiedAuthorizationRequest.dcqlQuery;
        if (verifiedAuthorizationRequest.clientIdScheme === 'entity_id') {
            const clientId = await verifiedAuthorizationRequest.authorizationRequest.getMergedProperty('client_id');
            if (!clientId) {
                throw new core_1.CredoError("Unable to extract 'client_id' from authorization request");
            }
            const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
            const entityConfiguration = await (0, core_2.fetchEntityConfiguration)({
                entityId: clientId,
                verifyJwtCallback: async ({ jwt, jwk }) => {
                    const res = await jwsService.verifyJws(agentContext, {
                        jws: jwt,
                        jwkResolver: () => (0, core_1.getJwkFromJson)(jwk),
                    });
                    return res.isValid;
                },
            });
            if (!entityConfiguration)
                throw new core_1.CredoError(`Unable to fetch entity configuration for entityId '${clientId}'`);
            const openidRelyingPartyMetadata = (_c = entityConfiguration.metadata) === null || _c === void 0 ? void 0 : _c.openid_relying_party;
            // When the metadata is present in the federation we want to use that instead of what is passed with the request
            if (openidRelyingPartyMetadata) {
                verifiedAuthorizationRequest.authorizationRequestPayload.client_metadata = openidRelyingPartyMetadata;
            }
        }
        return {
            authorizationRequest: verifiedAuthorizationRequest,
            // Parameters related to DIF Presentation Exchange
            presentationExchange: presentationDefinition
                ? {
                    definition: presentationDefinition,
                    credentialsForRequest: await this.presentationExchangeService.getCredentialsForRequest(agentContext, presentationDefinition),
                }
                : undefined,
            dcql: dcqlQuery
                ? {
                    queryResult: await this.dcqlService.getCredentialsForRequest(agentContext, dcqlQuery),
                }
                : undefined,
        };
    }
    async acceptAuthorizationRequest(agentContext, options) {
        var _a, _b;
        const { authorizationRequest, presentationExchange, dcql } = options;
        let openIdTokenIssuer = options.openIdTokenIssuer;
        let presentationExchangeOptions = undefined;
        let dcqlOptions = undefined;
        const wantsIdToken = await authorizationRequest.authorizationRequest.containsResponseType(did_auth_siop_1.ResponseType.ID_TOKEN);
        const authorizationResponseNonce = ((_a = authorizationRequest.authorizationRequestPayload.response_mode) === null || _a === void 0 ? void 0 : _a.endsWith('.jwt'))
            ? await agentContext.wallet.generateNonce()
            : '';
        if ((authorizationRequest.presentationDefinitions && authorizationRequest.presentationDefinitions.length > 0) ||
            authorizationRequest.dcqlQuery) {
            const nonce = await authorizationRequest.authorizationRequest.getMergedProperty('nonce');
            if (!nonce) {
                throw new core_1.CredoError("Unable to extract 'nonce' from authorization request");
            }
            const clientId = await authorizationRequest.authorizationRequest.getMergedProperty('client_id');
            if (!clientId) {
                throw new core_1.CredoError("Unable to extract 'client_id' from authorization request");
            }
            const responseUri = (_b = (await authorizationRequest.authorizationRequest.getMergedProperty('response_uri'))) !== null && _b !== void 0 ? _b : (await authorizationRequest.authorizationRequest.getMergedProperty('redirect_uri'));
            if (!responseUri) {
                throw new core_1.CredoError("Unable to extract 'response_uri' from authorization request");
            }
            if (authorizationRequest.dcqlQuery) {
                if (!dcql) {
                    throw new core_1.CredoError('Authorization request included dcql query. `dcql` MUST be supplied to accept authorization requests.');
                }
                const dcqlPresentation = await this.dcqlService.createPresentation(agentContext, {
                    credentialQueryToCredential: dcql.credentials,
                    challenge: nonce,
                    domain: clientId,
                    openid4vp: {
                        mdocGeneratedNonce: authorizationResponseNonce,
                        responseUri,
                    },
                });
                dcqlOptions = {
                    dcqlPresentation: this.dcqlService.getEncodedPresentations(dcqlPresentation),
                };
                if (wantsIdToken && !openIdTokenIssuer) {
                    const nonMdocPresentation = Object.values(dcqlPresentation).find((presentation) => presentation instanceof core_1.MdocDeviceResponse === false);
                    if (nonMdocPresentation) {
                        openIdTokenIssuer = this.getOpenIdTokenIssuerFromVerifiablePresentation(nonMdocPresentation);
                    }
                }
            }
            else if (authorizationRequest.presentationDefinitions &&
                authorizationRequest.presentationDefinitions.length > 0) {
                if (!presentationExchange) {
                    throw new core_1.CredoError('Authorization request included presentation definition. `presentationExchange` MUST be supplied to accept authorization requests.');
                }
                const { verifiablePresentations, presentationSubmission } = await this.presentationExchangeService.createPresentation(agentContext, {
                    credentialsForInputDescriptor: presentationExchange.credentials,
                    presentationDefinition: authorizationRequest.presentationDefinitions[0].definition,
                    challenge: nonce,
                    domain: clientId,
                    presentationSubmissionLocation: core_1.DifPresentationExchangeSubmissionLocation.EXTERNAL,
                    openid4vp: {
                        mdocGeneratedNonce: authorizationResponseNonce,
                        responseUri,
                    },
                });
                if (wantsIdToken && !openIdTokenIssuer) {
                    openIdTokenIssuer = this.getOpenIdTokenIssuerFromVerifiablePresentation(verifiablePresentations[0]);
                }
                presentationExchangeOptions = {
                    verifiablePresentations: verifiablePresentations.map((vp) => (0, transform_1.getSphereonVerifiablePresentation)(vp)),
                    presentationSubmission,
                    vpTokenLocation: did_auth_siop_1.VPTokenLocation.AUTHORIZATION_RESPONSE,
                };
            }
        }
        else if (options.presentationExchange) {
            throw new core_1.CredoError('`presentationExchange` was supplied, but no presentation definition was found in the presentation request.');
        }
        else if (options.dcql) {
            throw new core_1.CredoError('`dcql` was supplied, but no dcql_query was found in the presentation request.');
        }
        if (wantsIdToken) {
            if (!openIdTokenIssuer) {
                throw new core_1.CredoError('Unable to create authorization response. openIdTokenIssuer MUST be supplied when no presentation is active and the ResponseType includes id_token.');
            }
            this.assertValidTokenIssuer(authorizationRequest, openIdTokenIssuer);
        }
        const jwtIssuer = wantsIdToken && openIdTokenIssuer
            ? await (0, utils_1.openIdTokenIssuerToJwtIssuer)(agentContext, openIdTokenIssuer)
            : undefined;
        const openidProvider = await this.getOpenIdProvider(agentContext);
        const authorizationResponseWithCorrelationId = await openidProvider.createAuthorizationResponse(authorizationRequest, {
            jwtIssuer,
            presentationExchange: presentationExchangeOptions,
            dcqlQuery: dcqlOptions,
            // https://openid.net/specs/openid-connect-self-issued-v2-1_0.html#name-aud-of-a-request-object
            audience: authorizationRequest.authorizationRequestPayload.client_id,
        });
        const getCreateJarmResponseCallback = (authorizationResponseNonce) => {
            return async (opts) => {
                var _a;
                const { authorizationResponsePayload, requestObjectPayload } = opts;
                const jwk = await did_auth_siop_1.OP.extractEncJwksFromClientMetadata(requestObjectPayload.client_metadata);
                if (!jwk.kty) {
                    throw new core_1.CredoError('Missing kty in jwk.');
                }
                const validatedMetadata = did_auth_siop_1.OP.validateJarmMetadata({
                    client_metadata: requestObjectPayload.client_metadata,
                    server_metadata: {
                        authorization_encryption_alg_values_supported: ['ECDH-ES'],
                        authorization_encryption_enc_values_supported: ['A256GCM'],
                    },
                });
                if (validatedMetadata.type !== 'encrypted') {
                    throw new core_1.CredoError('Only encrypted JARM responses are supported.');
                }
                // Extract nonce from the request, we use this as the `apv`
                const nonce = (_a = authorizationRequest.payload) === null || _a === void 0 ? void 0 : _a.nonce;
                if (!nonce || typeof nonce !== 'string') {
                    throw new core_1.CredoError('Missing nonce in authorization request payload');
                }
                const jwe = await this.encryptJarmResponse(agentContext, {
                    jwkJson: jwk,
                    payload: authorizationResponsePayload,
                    authorizationRequestNonce: nonce,
                    alg: validatedMetadata.client_metadata.authorization_encrypted_response_alg,
                    enc: validatedMetadata.client_metadata.authorization_encrypted_response_enc,
                    authorizationResponseNonce,
                });
                return { response: jwe };
            };
        };
        const response = await openidProvider.submitAuthorizationResponse(authorizationResponseWithCorrelationId, getCreateJarmResponseCallback(authorizationResponseNonce));
        const responseText = await response
            .clone()
            .text()
            .catch(() => null);
        const responseJson = (await response
            .clone()
            .json()
            .catch(() => null));
        if (!response.ok) {
            return {
                ok: false,
                serverResponse: {
                    status: response.status,
                    body: responseJson !== null && responseJson !== void 0 ? responseJson : responseText,
                },
                submittedResponse: authorizationResponseWithCorrelationId.response.payload,
            };
        }
        return {
            ok: true,
            serverResponse: {
                status: response.status,
                body: responseJson !== null && responseJson !== void 0 ? responseJson : {},
            },
            submittedResponse: authorizationResponseWithCorrelationId.response.payload,
            redirectUri: responseJson === null || responseJson === void 0 ? void 0 : responseJson.redirect_uri,
            presentationDuringIssuanceSession: responseJson === null || responseJson === void 0 ? void 0 : responseJson.presentation_during_issuance_session,
        };
    }
    async getOpenIdProvider(agentContext, options = {}) {
        const builder = did_auth_siop_1.OP.builder()
            .withExpiresIn(6000)
            .withIssuer(did_auth_siop_1.ResponseIss.SELF_ISSUED_V2)
            .withResponseMode(did_auth_siop_1.ResponseMode.POST)
            .withSupportedVersions([
            did_auth_siop_1.SupportedVersion.SIOPv2_D11,
            did_auth_siop_1.SupportedVersion.SIOPv2_D12_OID4VP_D18,
            did_auth_siop_1.SupportedVersion.SIOPv2_D12_OID4VP_D20,
        ])
            .withCreateJwtCallback((0, utils_1.getCreateJwtCallback)(agentContext))
            .withVerifyJwtCallback((0, utils_1.getVerifyJwtCallback)(agentContext, {
            federation: options.federation,
            trustedCertificates: options.trustedCertificates,
        }))
            .withHasher(core_1.Hasher.hash);
        const openidProvider = builder.build();
        return openidProvider;
    }
    getOpenIdTokenIssuerFromVerifiablePresentation(verifiablePresentation) {
        let openIdTokenIssuer;
        if (verifiablePresentation instanceof core_1.W3cJsonLdVerifiablePresentation) {
            const [firstProof] = (0, core_1.asArray)(verifiablePresentation.proof);
            if (!firstProof)
                throw new core_1.CredoError('Verifiable presentation does not contain a proof');
            if (!firstProof.verificationMethod.startsWith('did:')) {
                throw new core_1.CredoError('Verifiable presentation proof verificationMethod is not a did. Unable to extract openIdTokenIssuer from verifiable presentation');
            }
            openIdTokenIssuer = {
                method: 'did',
                didUrl: firstProof.verificationMethod,
            };
        }
        else if (verifiablePresentation instanceof core_1.W3cJwtVerifiablePresentation) {
            const kid = verifiablePresentation.jwt.header.kid;
            if (!kid)
                throw new core_1.CredoError('Verifiable Presentation does not contain a kid in the jwt header');
            if (kid.startsWith('#') && verifiablePresentation.presentation.holderId) {
                openIdTokenIssuer = {
                    didUrl: `${verifiablePresentation.presentation.holderId}${kid}`,
                    method: 'did',
                };
            }
            else if (kid.startsWith('did:')) {
                openIdTokenIssuer = {
                    didUrl: kid,
                    method: 'did',
                };
            }
            else {
                throw new core_1.CredoError("JWT W3C Verifiable presentation does not include did in JWT header 'kid'. Unable to extract openIdTokenIssuer from verifiable presentation");
            }
        }
        else if (verifiablePresentation instanceof core_1.MdocDeviceResponse) {
            throw new core_1.CredoError('Mdoc Verifiable Presentations are not yet supported');
        }
        else {
            const cnf = verifiablePresentation.payload.cnf;
            // FIXME: SD-JWT VC should have better payload typing, so this doesn't become so ugly
            if (!cnf ||
                typeof cnf !== 'object' ||
                !('kid' in cnf) ||
                typeof cnf.kid !== 'string' ||
                !cnf.kid.startsWith('did:') ||
                !cnf.kid.includes('#')) {
                throw new core_1.CredoError("SD-JWT Verifiable presentation has no 'cnf' claim or does not include 'cnf' claim where 'kid' is a didUrl pointing to a key. Unable to extract openIdTokenIssuer from verifiable presentation");
            }
            openIdTokenIssuer = {
                didUrl: cnf.kid,
                method: 'did',
            };
        }
        return openIdTokenIssuer;
    }
    assertValidTokenIssuer(authorizationRequest, openIdTokenIssuer) {
        const subjectSyntaxTypesSupported = authorizationRequest.registrationMetadataPayload.subject_syntax_types_supported;
        if (!subjectSyntaxTypesSupported) {
            throw new core_1.CredoError('subject_syntax_types_supported is not supplied in the registration metadata. subject_syntax_types is REQUIRED.');
        }
        let allowedSubjectSyntaxTypes = [];
        if (openIdTokenIssuer.method === 'did') {
            const parsedDid = (0, core_1.parseDid)(openIdTokenIssuer.didUrl);
            // Either did:<method> or did (for all did methods) is allowed
            allowedSubjectSyntaxTypes = [`did:${parsedDid.method}`, 'did'];
        }
        else if (openIdTokenIssuer.method === 'jwk') {
            allowedSubjectSyntaxTypes = ['urn:ietf:params:oauth:jwk-thumbprint'];
        }
        else {
            throw new core_1.CredoError("Only 'did' and 'jwk' are supported as openIdTokenIssuer at the moment");
        }
        // At least one of the allowed subject syntax types must be supported by the RP
        if (!allowedSubjectSyntaxTypes.some((allowed) => subjectSyntaxTypesSupported.includes(allowed))) {
            throw new core_1.CredoError([
                'The provided openIdTokenIssuer is not supported by the relying party.',
                `Supported subject syntax types: '${subjectSyntaxTypesSupported.join(', ')}'`,
            ].join('\n'));
        }
    }
    async encryptJarmResponse(agentContext, options) {
        const { payload, jwkJson } = options;
        const jwk = (0, core_1.getJwkFromJson)(jwkJson);
        const key = jwk.key;
        if (!agentContext.wallet.directEncryptCompactJweEcdhEs) {
            throw new core_1.CredoError('Cannot decrypt Jarm Response, wallet does not support directEncryptCompactJweEcdhEs. You need to upgrade your wallet implementation.');
        }
        if (options.alg !== 'ECDH-ES') {
            throw new core_1.CredoError("Only 'ECDH-ES' is supported as 'alg' value for JARM response encryption");
        }
        if (options.enc !== 'A256GCM') {
            throw new core_1.CredoError("Only 'A256GCM' is supported as 'enc' value for JARM response encryption");
        }
        if (key.keyType !== core_1.KeyType.P256) {
            throw new core_1.CredoError(`Only '${core_1.KeyType.P256}' key type is supported for JARM response encryption`);
        }
        const data = core_1.Buffer.from(JSON.stringify(payload));
        const jwe = await agentContext.wallet.directEncryptCompactJweEcdhEs({
            data,
            recipientKey: key,
            header: {
                kid: jwkJson.kid,
            },
            encryptionAlgorithm: options.enc,
            apu: core_1.TypedArrayEncoder.toBase64URL(core_1.TypedArrayEncoder.fromString(options.authorizationResponseNonce)),
            apv: core_1.TypedArrayEncoder.toBase64URL(core_1.TypedArrayEncoder.fromString(options.authorizationRequestNonce)),
        });
        return jwe;
    }
    async resolveOpenIdFederationChains(agentContext, options) {
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const { entityId, trustAnchorEntityIds } = options;
        return (0, core_2.resolveTrustChains)({
            entityId,
            trustAnchorEntityIds,
            verifyJwtCallback: async ({ jwt, jwk }) => {
                const res = await jwsService.verifyJws(agentContext, {
                    jws: jwt,
                    jwkResolver: () => (0, core_1.getJwkFromJson)(jwk),
                    trustedCertificates: [],
                });
                return res.isValid;
            },
        });
    }
    async fetchOpenIdFederationEntityConfiguration(agentContext, options) {
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const { entityId } = options;
        return (0, core_2.fetchEntityConfiguration)({
            entityId,
            verifyJwtCallback: async ({ jwt, jwk }) => {
                const res = await jwsService.verifyJws(agentContext, {
                    jws: jwt,
                    jwkResolver: () => (0, core_1.getJwkFromJson)(jwk),
                    trustedCertificates: [],
                });
                return res.isValid;
            },
        });
    }
};
exports.OpenId4VcSiopHolderService = OpenId4VcSiopHolderService;
exports.OpenId4VcSiopHolderService = OpenId4VcSiopHolderService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.DifPresentationExchangeService,
        core_1.DcqlService])
], OpenId4VcSiopHolderService);
//# sourceMappingURL=OpenId4vcSiopHolderService.js.map