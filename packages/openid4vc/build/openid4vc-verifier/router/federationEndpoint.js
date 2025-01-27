"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureFederationEndpoint = configureFederationEndpoint;
const core_1 = require("@credo-ts/core");
const core_2 = require("@openid-federation/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const router_1 = require("../../shared/router");
const OpenId4VcSiopVerifierService_1 = require("../OpenId4VcSiopVerifierService");
const OpenId4VcVerifierModuleConfig_1 = require("../OpenId4VcVerifierModuleConfig");
// TODO: Add types but this function is originally from the @
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createRPRegistrationMetadataPayload = (opts) => {
    const rpRegistrationMetadataPayload = {
        id_token_signing_alg_values_supported: opts.idTokenSigningAlgValuesSupported,
        request_object_signing_alg_values_supported: opts.requestObjectSigningAlgValuesSupported,
        response_types_supported: opts.responseTypesSupported,
        scopes_supported: opts.scopesSupported,
        subject_types_supported: opts.subjectTypesSupported,
        subject_syntax_types_supported: opts.subject_syntax_types_supported || ['did:web:', 'did:ion:'],
        vp_formats: opts.vpFormatsSupported,
        client_name: opts.client_name,
        logo_uri: opts.logo_uri,
        tos_uri: opts.tos_uri,
        client_purpose: opts.clientPurpose,
        client_id: opts.client_id,
    };
    const languageTagEnabledFieldsNamesMapping = new Map();
    languageTagEnabledFieldsNamesMapping.set('clientName', 'client_name');
    languageTagEnabledFieldsNamesMapping.set('clientPurpose', 'client_purpose');
    //   TODO: Do we need this?
    const languageTaggedFields = did_auth_siop_1.LanguageTagUtils.getLanguageTaggedPropertiesMapped(opts, languageTagEnabledFieldsNamesMapping);
    languageTaggedFields.forEach((value, key) => {
        const _key = key;
        rpRegistrationMetadataPayload[_key] = value;
    });
    return (0, did_auth_siop_1.removeNullUndefined)(rpRegistrationMetadataPayload);
};
function configureFederationEndpoint(router, federationConfig = {}) {
    // TODO: this whole result needs to be cached and the ttl should be the expires of this node
    // TODO: This will not work for multiple instances so we have to save it in the database.
    const federationKeyMapping = new Map();
    const rpSigningKeyMapping = new Map();
    router.get('/.well-known/openid-federation', async (request, response, next) => {
        var _a;
        const { agentContext, verifier } = (0, router_1.getRequestContext)(request);
        const verifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
        const verifierConfig = agentContext.dependencyManager.resolve(OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig);
        try {
            let federationKey = federationKeyMapping.get(verifier.verifierId);
            if (!federationKey) {
                federationKey = await agentContext.wallet.createKey({
                    keyType: core_1.KeyType.Ed25519,
                });
                federationKeyMapping.set(verifier.verifierId, federationKey);
            }
            let rpSigningKey = rpSigningKeyMapping.get(verifier.verifierId);
            if (!rpSigningKey) {
                rpSigningKey = await agentContext.wallet.createKey({
                    keyType: core_1.KeyType.Ed25519,
                });
                rpSigningKeyMapping.set(verifier.verifierId, rpSigningKey);
            }
            const relyingParty = await verifierService.getRelyingParty(agentContext, verifier, {
                clientId: verifierConfig.baseUrl,
                clientIdScheme: 'entity_id',
                authorizationResponseUrl: `${verifierConfig.baseUrl}/siop/${verifier.verifierId}/authorize`,
            });
            const verifierEntityId = `${verifierConfig.baseUrl}/${verifier.verifierId}`;
            const rpMetadata = createRPRegistrationMetadataPayload(relyingParty.createRequestOptions.clientMetadata);
            // TODO: We also need to cache the entity configuration until it expires
            const now = new Date();
            // TODO: We also need to check if the x509 certificate is still valid until this expires
            const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 1 day
            const jwk = (0, core_1.getJwkFromKey)(federationKey);
            const alg = jwk.supportedSignatureAlgorithms[0];
            const kid = federationKey.fingerprint;
            const authorityHints = await ((_a = federationConfig.getAuthorityHints) === null || _a === void 0 ? void 0 : _a.call(federationConfig, agentContext, {
                verifierId: verifier.verifierId,
                issuerEntityId: verifierEntityId,
            }));
            const entityConfiguration = await (0, core_2.createEntityConfiguration)({
                header: {
                    kid,
                    alg,
                    typ: 'entity-statement+jwt',
                },
                claims: {
                    sub: verifierEntityId,
                    iss: verifierEntityId,
                    iat: now,
                    exp: expires,
                    jwks: {
                        keys: [Object.assign({ kid, alg }, jwk.toJson())],
                    },
                    authority_hints: authorityHints,
                    metadata: {
                        federation_entity: {
                            organization_name: rpMetadata.client_name,
                            logo_uri: rpMetadata.logo_uri,
                            federation_fetch_endpoint: `${verifierEntityId}/openid-federation/fetch`,
                        },
                        openid_relying_party: Object.assign(Object.assign({}, rpMetadata), { jwks: {
                                keys: [Object.assign({ kid: rpSigningKey.fingerprint, alg }, (0, core_1.getJwkFromKey)(rpSigningKey).toJson())],
                            }, client_registration_types: ['automatic'] }),
                    },
                },
                signJwtCallback: ({ toBeSigned }) => agentContext.wallet.sign({
                    data: toBeSigned,
                    key: federationKey,
                }),
            });
            response.writeHead(200, { 'Content-Type': 'application/entity-statement+jwt' }).end(entityConfiguration);
        }
        catch (error) {
            agentContext.config.logger.error('Failed to create entity configuration', {
                error,
            });
            (0, router_1.sendErrorResponse)(response, next, agentContext.config.logger, 500, 'invalid_request', error);
            return;
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
    // TODO: Currently it will fetch everything in realtime and creates a entity statement without even checking if it is allowed.
    router.get('/openid-federation/fetch', async (request, response, next) => {
        var _a;
        const { agentContext, verifier } = (0, router_1.getRequestContext)(request);
        const { sub } = request.query;
        if (!sub || typeof sub !== 'string') {
            (0, router_1.sendErrorResponse)(response, next, agentContext.config.logger, 400, 'invalid_request', 'sub is required');
            return;
        }
        const verifierConfig = agentContext.dependencyManager.resolve(OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig);
        const entityId = `${verifierConfig.baseUrl}/${verifier.verifierId}`;
        const isSubordinateEntity = await ((_a = federationConfig.isSubordinateEntity) === null || _a === void 0 ? void 0 : _a.call(federationConfig, agentContext, {
            verifierId: verifier.verifierId,
            issuerEntityId: entityId,
            subjectEntityId: sub,
        }));
        if (!isSubordinateEntity) {
            if (!federationConfig.isSubordinateEntity) {
                agentContext.config.logger.warn('isSubordinateEntity hook is not provided for the federation so we cannot check if this entity is a subordinate entity of the issuer', {
                    verifierId: verifier.verifierId,
                    issuerEntityId: entityId,
                    subjectEntityId: sub,
                });
            }
            (0, router_1.sendErrorResponse)(response, next, agentContext.config.logger, 403, 'forbidden', 'This entity is not a subordinate entity of the issuer');
            return;
        }
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        const subjectEntityConfiguration = await (0, core_2.fetchEntityConfiguration)({
            entityId: sub,
            verifyJwtCallback: async ({ jwt, jwk }) => {
                const res = await jwsService.verifyJws(agentContext, {
                    jws: jwt,
                    jwkResolver: () => (0, core_1.getJwkFromJson)(jwk),
                });
                return res.isValid;
            },
        });
        let federationKey = federationKeyMapping.get(verifier.verifierId);
        if (!federationKey) {
            federationKey = await agentContext.wallet.createKey({
                keyType: core_1.KeyType.Ed25519,
            });
            federationKeyMapping.set(verifier.verifierId, federationKey);
        }
        const jwk = (0, core_1.getJwkFromKey)(federationKey);
        const alg = jwk.supportedSignatureAlgorithms[0];
        const kid = federationKey.fingerprint;
        const entityStatement = await (0, core_2.createEntityStatement)({
            header: {
                kid,
                alg,
                typ: 'entity-statement+jwt',
            },
            jwk: Object.assign(Object.assign({}, jwk.toJson()), { kid }),
            claims: {
                sub: sub,
                iss: entityId,
                iat: new Date(),
                exp: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day TODO: Might needs to be a bit lower because a day is quite long for trust
                jwks: {
                    keys: subjectEntityConfiguration.jwks.keys,
                },
            },
            signJwtCallback: ({ toBeSigned }) => agentContext.wallet.sign({
                data: toBeSigned,
                key: federationKey,
            }),
        });
        response.writeHead(200, { 'Content-Type': 'application/entity-statement+jwt' }).end(entityStatement);
    });
}
//# sourceMappingURL=federationEndpoint.js.map