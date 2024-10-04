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
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const transform_1 = require("../shared/transform");
const utils_1 = require("../shared/utils");
let OpenId4VcSiopHolderService = class OpenId4VcSiopHolderService {
    constructor(presentationExchangeService) {
        this.presentationExchangeService = presentationExchangeService;
    }
    async resolveAuthorizationRequest(agentContext, requestJwtOrUri) {
        var _a, _b;
        const openidProvider = await this.getOpenIdProvider(agentContext);
        // parsing happens automatically in verifyAuthorizationRequest
        const verifiedAuthorizationRequest = await openidProvider.verifyAuthorizationRequest(requestJwtOrUri);
        agentContext.config.logger.debug(`verified SIOP Authorization Request for issuer '${verifiedAuthorizationRequest.issuer}'`);
        agentContext.config.logger.debug(`requestJwtOrUri '${requestJwtOrUri}'`);
        if (verifiedAuthorizationRequest.presentationDefinitions &&
            verifiedAuthorizationRequest.presentationDefinitions.length > 1) {
            throw new core_1.CredoError('Only a single presentation definition is supported.');
        }
        const presentationDefinition = (_b = (_a = verifiedAuthorizationRequest.presentationDefinitions) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.definition;
        return {
            authorizationRequest: verifiedAuthorizationRequest,
            // Parameters related to DIF Presentation Exchange
            presentationExchange: presentationDefinition
                ? {
                    definition: presentationDefinition,
                    credentialsForRequest: await this.presentationExchangeService.getCredentialsForRequest(agentContext, presentationDefinition),
                }
                : undefined,
        };
    }
    async acceptAuthorizationRequest(agentContext, options) {
        const { authorizationRequest, presentationExchange } = options;
        let openIdTokenIssuer = options.openIdTokenIssuer;
        let presentationExchangeOptions = undefined;
        const wantsIdToken = await authorizationRequest.authorizationRequest.containsResponseType(did_auth_siop_1.ResponseType.ID_TOKEN);
        // Handle presentation exchange part
        if (authorizationRequest.presentationDefinitions && authorizationRequest.presentationDefinitions.length > 0) {
            if (!presentationExchange) {
                throw new core_1.CredoError('Authorization request included presentation definition. `presentationExchange` MUST be supplied to accept authorization requests.');
            }
            const nonce = await authorizationRequest.authorizationRequest.getMergedProperty('nonce');
            if (!nonce) {
                throw new core_1.CredoError("Unable to extract 'nonce' from authorization request");
            }
            const clientId = await authorizationRequest.authorizationRequest.getMergedProperty('client_id');
            if (!clientId) {
                throw new core_1.CredoError("Unable to extract 'client_id' from authorization request");
            }
            const { verifiablePresentations, presentationSubmission } = await this.presentationExchangeService.createPresentation(agentContext, {
                credentialsForInputDescriptor: presentationExchange.credentials,
                presentationDefinition: authorizationRequest.presentationDefinitions[0].definition,
                challenge: nonce,
                domain: clientId,
                presentationSubmissionLocation: core_1.DifPresentationExchangeSubmissionLocation.EXTERNAL,
            });
            presentationExchangeOptions = {
                verifiablePresentations: verifiablePresentations.map((vp) => (0, transform_1.getSphereonVerifiablePresentation)(vp)),
                presentationSubmission,
                vpTokenLocation: did_auth_siop_1.VPTokenLocation.AUTHORIZATION_RESPONSE,
            };
            if (wantsIdToken && !openIdTokenIssuer) {
                openIdTokenIssuer = this.getOpenIdTokenIssuerFromVerifiablePresentation(verifiablePresentations[0]);
            }
        }
        else if (options.presentationExchange) {
            throw new core_1.CredoError('`presentationExchange` was supplied, but no presentation definition was found in the presentation request.');
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
            // https://openid.net/specs/openid-connect-self-issued-v2-1_0.html#name-aud-of-a-request-object
            audience: authorizationRequest.authorizationRequestPayload.client_id,
        });
        const createJarmResponse = async (opts) => {
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
            const jwe = await this.encryptJarmResponse(agentContext, {
                jwkJson: Object.assign(Object.assign({}, jwk), { kty: jwk.kty }),
                payload: authorizationResponsePayload,
                encryptionAlgorithm: validatedMetadata.client_metadata.authorization_encrypted_response_alg,
                enc: validatedMetadata.client_metadata.authorization_encrypted_response_enc,
            });
            return { response: jwe };
        };
        const response = await openidProvider.submitAuthorizationResponse(authorizationResponseWithCorrelationId, createJarmResponse);
        let responseDetails = undefined;
        try {
            responseDetails = await response.text();
            if (responseDetails.includes('{')) {
                responseDetails = JSON.parse(responseDetails);
            }
        }
        catch (error) {
            // no-op
        }
        return {
            serverResponse: {
                status: response.status,
                body: responseDetails,
            },
            submittedResponse: authorizationResponseWithCorrelationId.response.payload,
        };
    }
    async getOpenIdProvider(agentContext) {
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
            .withVerifyJwtCallback((0, utils_1.getVerifyJwtCallback)(agentContext))
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
        // TODO: jwk thumbprint support
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
        else {
            throw new core_1.CredoError("Only 'did' is supported as openIdTokenIssuer at the moment");
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
        const data = core_1.Buffer.from(JSON.stringify(payload));
        const jwe = await agentContext.wallet.directEncryptCompactJweEcdhEs({
            data,
            recipientKey: key,
            header: {
                alg: jwkJson.alg,
                kid: jwkJson.kid,
                enc: 'A256GCM',
            },
            encryptionAlgorithm: 'A256GCM',
        });
        return jwe;
    }
};
exports.OpenId4VcSiopHolderService = OpenId4VcSiopHolderService;
exports.OpenId4VcSiopHolderService = OpenId4VcSiopHolderService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.DifPresentationExchangeService])
], OpenId4VcSiopHolderService);
//# sourceMappingURL=OpenId4vcSiopHolderService.js.map