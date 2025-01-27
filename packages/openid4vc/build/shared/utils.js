"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedJwaSignatureAlgorithms = getSupportedJwaSignatureAlgorithms;
exports.getKeyFromDid = getKeyFromDid;
exports.getVerifyJwtCallback = getVerifyJwtCallback;
exports.getCreateJwtCallback = getCreateJwtCallback;
exports.openIdTokenIssuerToJwtIssuer = openIdTokenIssuerToJwtIssuer;
exports.getProofTypeFromKey = getProofTypeFromKey;
exports.addSecondsToDate = addSecondsToDate;
exports.dateToSeconds = dateToSeconds;
const core_1 = require("@credo-ts/core");
const core_2 = require("@openid-federation/core");
/**
 * Returns the JWA Signature Algorithms that are supported by the wallet.
 *
 * This is an approximation based on the supported key types of the wallet.
 * This is not 100% correct as a supporting a key type does not mean you support
 * all the algorithms for that key type. However, this needs refactoring of the wallet
 * that is planned for the 0.5.0 release.
 */
function getSupportedJwaSignatureAlgorithms(agentContext) {
    const supportedKeyTypes = agentContext.wallet.supportedKeyTypes;
    // Extract the supported JWS algs based on the key types the wallet support.
    const supportedJwaSignatureAlgorithms = supportedKeyTypes
        // Map the supported key types to the supported JWK class
        .map(core_1.getJwkClassFromKeyType)
        // Filter out the undefined values
        .filter((jwkClass) => jwkClass !== undefined)
        // Extract the supported JWA signature algorithms from the JWK class
        .flatMap((jwkClass) => jwkClass.supportedSignatureAlgorithms);
    return supportedJwaSignatureAlgorithms;
}
async function getKeyFromDid(agentContext, didUrl, allowedPurposes = ['authentication']) {
    const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
    const didDocument = await didsApi.resolveDidDocument(didUrl);
    const verificationMethod = didDocument.dereferenceKey(didUrl, allowedPurposes);
    return (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
}
function getVerifyJwtCallback(agentContext, options = {}) {
    const logger = agentContext.config.logger;
    return async (jwtVerifier, jwt) => {
        var _a, _b, _c, _d, _e, _f;
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        let trustedCertificates = options.trustedCertificates;
        if (jwtVerifier.method === 'did') {
            const key = await getKeyFromDid(agentContext, jwtVerifier.didUrl);
            const jwk = (0, core_1.getJwkFromKey)(key);
            const res = await jwsService.verifyJws(agentContext, {
                jws: jwt.raw,
                jwkResolver: () => jwk,
                // No certificates trusted
                trustedCertificates: [],
            });
            return res.isValid;
        }
        else if (jwtVerifier.method === 'x5c' || jwtVerifier.method === 'jwk') {
            if (jwtVerifier.type === 'request-object') {
                const x509Config = agentContext.dependencyManager.resolve(core_1.X509ModuleConfig);
                const certificateChain = (_a = jwt.header.x5c) === null || _a === void 0 ? void 0 : _a.map((cert) => core_1.X509Certificate.fromEncodedCertificate(cert));
                if (!trustedCertificates && certificateChain && x509Config.getTrustedCertificatesForVerification) {
                    trustedCertificates = await x509Config.getTrustedCertificatesForVerification(agentContext, {
                        certificateChain,
                        verification: {
                            type: 'oauth2SecuredAuthorizationRequest',
                            authorizationRequest: {
                                jwt: jwt.raw,
                                payload: core_1.JwtPayload.fromJson(jwt.payload),
                            },
                        },
                    });
                }
                if (!trustedCertificates) {
                    // We also take from the config here to avoid the callback being called again
                    trustedCertificates = (_b = x509Config.trustedCertificates) !== null && _b !== void 0 ? _b : [];
                }
            }
            const res = await jwsService.verifyJws(agentContext, {
                jws: jwt.raw,
                // Only allowed for request object
                trustedCertificates: jwtVerifier.type === 'request-object' ? trustedCertificates : [],
            });
            return res.isValid;
        }
        if (jwtVerifier.method === 'openid-federation') {
            const { entityId } = jwtVerifier;
            const trustedEntityIds = (_c = options.federation) === null || _c === void 0 ? void 0 : _c.trustedEntityIds;
            if (!trustedEntityIds) {
                logger.error('No trusted entity ids provided but is required for the "openid-federation" method.');
                return false;
            }
            const validTrustChains = await (0, core_2.resolveTrustChains)({
                entityId,
                trustAnchorEntityIds: trustedEntityIds,
                verifyJwtCallback: async ({ jwt, jwk }) => {
                    const res = await jwsService.verifyJws(agentContext, {
                        jws: jwt,
                        jwkResolver: () => (0, core_1.getJwkFromJson)(jwk),
                        trustedCertificates: [],
                    });
                    return res.isValid;
                },
            });
            // When the chain is already invalid we can return false immediately
            if (validTrustChains.length === 0) {
                logger.error(`${entityId} is not part of a trusted federation.`);
                return false;
            }
            // Pick the first valid trust chain for validation of the leaf entity jwks
            const { leafEntityConfiguration } = validTrustChains[0];
            // TODO: No support yet for signed jwks and external jwks
            const rpSigningKeys = (_f = (_e = (_d = leafEntityConfiguration === null || leafEntityConfiguration === void 0 ? void 0 : leafEntityConfiguration.metadata) === null || _d === void 0 ? void 0 : _d.openid_relying_party) === null || _e === void 0 ? void 0 : _e.jwks) === null || _f === void 0 ? void 0 : _f.keys;
            if (!rpSigningKeys || rpSigningKeys.length === 0)
                throw new core_1.CredoError('No rp signing keys found in the entity configuration.');
            const res = await jwsService.verifyJws(agentContext, {
                jws: jwt.raw,
                jwkResolver: () => (0, core_1.getJwkFromJson)(rpSigningKeys[0]),
                trustedCertificates: [],
            });
            if (!res.isValid) {
                logger.error(`${entityId} does not match the expected signing key.`);
            }
            // TODO: There is no check yet for the policies
            return res.isValid;
        }
        throw new Error(`Unsupported jwt verifier method: '${jwtVerifier.method}'`);
    };
}
function getCreateJwtCallback(agentContext) {
    return async (jwtIssuer, jwt) => {
        var _a;
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        if (jwtIssuer.method === 'did') {
            const key = await getKeyFromDid(agentContext, jwtIssuer.didUrl);
            const jws = await jwsService.createJwsCompact(agentContext, {
                protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { alg: jwtIssuer.alg, jwk: undefined }),
                payload: core_1.JwtPayload.fromJson(jwt.payload),
                key,
            });
            return jws;
        }
        if (jwtIssuer.method === 'jwk') {
            if (!jwtIssuer.jwk.kty) {
                throw new core_1.CredoError('Missing required key type (kty) in the jwk.');
            }
            const jwk = (0, core_1.getJwkFromJson)(jwtIssuer.jwk);
            const key = jwk.key;
            const jws = await jwsService.createJwsCompact(agentContext, {
                protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { jwk, alg: jwtIssuer.alg }),
                payload: core_1.JwtPayload.fromJson(jwt.payload),
                key,
            });
            return jws;
        }
        if (jwtIssuer.method === 'x5c') {
            const leafCertificate = core_1.X509Service.getLeafCertificate(agentContext, { certificateChain: jwtIssuer.x5c });
            const jws = await jwsService.createJwsCompact(agentContext, {
                protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { alg: jwtIssuer.alg, jwk: undefined }),
                payload: core_1.JwtPayload.fromJson(jwt.payload),
                key: leafCertificate.publicKey,
            });
            return jws;
        }
        if (jwtIssuer.method === 'custom') {
            // TODO: This could be used as the issuer and verifier. Based on that we need to search for a jwk in the entity configuration
            const { options } = jwtIssuer;
            if (!options)
                throw new core_1.CredoError(`Custom jwtIssuer must have options defined.`);
            if (!options.method)
                throw new core_1.CredoError(`Custom jwtIssuer's options must have a 'method' property defined.`);
            if (options.method !== 'openid-federation')
                throw new core_1.CredoError(`Custom jwtIssuer's options 'method' property must be 'openid-federation' when using the 'custom' method.`);
            if (!options.entityId)
                throw new core_1.CredoError(`Custom jwtIssuer must have entityId defined.`);
            if (typeof options.entityId !== 'string')
                throw new core_1.CredoError(`Custom jwtIssuer's entityId must be a string.`);
            const { entityId } = options;
            const entityConfiguration = await (0, core_2.fetchEntityConfiguration)({
                entityId,
                verifyJwtCallback: async ({ jwt, jwk }) => {
                    const res = await jwsService.verifyJws(agentContext, { jws: jwt, jwkResolver: () => (0, core_1.getJwkFromJson)(jwk) });
                    return res.isValid;
                },
            });
            // TODO: Not really sure if this is also used for the issuer so if so we need to change this logic. But currently it's not possible to specify a issuer method with issuance so I think it's fine.
            // NOTE: Hardcoded part for the verifier
            const openIdRelyingParty = (_a = entityConfiguration.metadata) === null || _a === void 0 ? void 0 : _a.openid_relying_party;
            if (!openIdRelyingParty)
                throw new core_1.CredoError('No openid-relying-party found in the entity configuration.');
            // NOTE: No support for signed jwks and external jwks
            const jwks = openIdRelyingParty.jwks;
            if (!jwks)
                throw new core_1.CredoError('No jwks found in the openid-relying-party.');
            // TODO: Not 100% sure what key to pick here I think the one that matches the kid in the jwt header of the entity configuration or we should pass a alg and pick a jwk based on that?
            const jwk = (0, core_1.getJwkFromJson)(jwks.keys[0]);
            // TODO: This gives a weird error when the private key is not available in the wallet so we should handle that better
            const jws = await jwsService.createJwsCompact(agentContext, {
                protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { jwk, alg: jwk.supportedSignatureAlgorithms[0] }),
                payload: core_1.JwtPayload.fromJson(jwt.payload),
                key: jwk.key,
            });
            return jws;
        }
        // @ts-expect-error - All methods are supported currently so there is no unsupported method anymore
        throw new Error(`Unsupported jwt issuer method '${jwtIssuer.method}'`);
    };
}
async function openIdTokenIssuerToJwtIssuer(agentContext, openId4VcTokenIssuer) {
    var _a;
    if (openId4VcTokenIssuer.method === 'did') {
        const key = await getKeyFromDid(agentContext, openId4VcTokenIssuer.didUrl);
        const alg = (_a = (0, core_1.getJwkClassFromKeyType)(key.keyType)) === null || _a === void 0 ? void 0 : _a.supportedSignatureAlgorithms[0];
        if (!alg)
            throw new core_1.CredoError(`No supported signature algorithms for key type: ${key.keyType}`);
        return {
            method: openId4VcTokenIssuer.method,
            didUrl: openId4VcTokenIssuer.didUrl,
            alg,
        };
    }
    if (openId4VcTokenIssuer.method === 'x5c') {
        const leafCertificate = core_1.X509Service.getLeafCertificate(agentContext, {
            certificateChain: openId4VcTokenIssuer.x5c,
        });
        const jwk = (0, core_1.getJwkFromKey)(leafCertificate.publicKey);
        const alg = jwk.supportedSignatureAlgorithms[0];
        if (!alg) {
            throw new core_1.CredoError(`No supported signature algorithms found key type: '${jwk.keyType}'`);
        }
        if (!openId4VcTokenIssuer.issuer.startsWith('https://') &&
            !(openId4VcTokenIssuer.issuer.startsWith('http://') && agentContext.config.allowInsecureHttpUrls)) {
            throw new core_1.CredoError('The X509 certificate issuer must be a HTTPS URI.');
        }
        if (!leafCertificate.sanUriNames.includes(openId4VcTokenIssuer.issuer) &&
            !leafCertificate.sanDnsNames.includes((0, core_1.getDomainFromUrl)(openId4VcTokenIssuer.issuer))) {
            const sanUriMessage = leafCertificate.sanUriNames.length > 0
                ? `SAN-URI names are ${leafCertificate.sanUriNames.join(', ')}`
                : 'there are no SAN-URI names';
            const sanDnsMessage = leafCertificate.sanDnsNames.length > 0
                ? `SAN-DNS names are ${leafCertificate.sanDnsNames.join(', ')}`
                : 'there are no SAN-DNS names';
            throw new Error(`The 'iss' claim in the payload does not match a 'SAN-URI' or 'SAN-DNS' name in the x5c certificate. 'iss' value is '${openId4VcTokenIssuer.issuer}', ${sanUriMessage}, ${sanDnsMessage} (for SAN-DNS only domain has to match)`);
        }
        return Object.assign(Object.assign({}, openId4VcTokenIssuer), { alg });
    }
    if (openId4VcTokenIssuer.method === 'jwk') {
        const alg = openId4VcTokenIssuer.jwk.supportedSignatureAlgorithms[0];
        if (!alg) {
            throw new core_1.CredoError(`No supported signature algorithms for key type: '${openId4VcTokenIssuer.jwk.keyType}'`);
        }
        return Object.assign(Object.assign({}, openId4VcTokenIssuer), { jwk: openId4VcTokenIssuer.jwk.toJson(), alg });
    }
    if (openId4VcTokenIssuer.method === 'openid-federation') {
        // TODO: Not sure what we want here if we need to add a new type to the sphereon library or that we can do it with the custom issuer
        return {
            method: 'custom',
            options: {
                method: 'openid-federation',
                entityId: openId4VcTokenIssuer.entityId,
            },
        };
    }
    throw new core_1.CredoError(`Unsupported jwt issuer method '${openId4VcTokenIssuer.method}'`);
}
function getProofTypeFromKey(agentContext, key) {
    const signatureSuiteRegistry = agentContext.dependencyManager.resolve(core_1.SignatureSuiteRegistry);
    const supportedSignatureSuites = signatureSuiteRegistry.getAllByKeyType(key.keyType);
    if (supportedSignatureSuites.length === 0) {
        throw new core_1.CredoError(`Couldn't find a supported signature suite for the given key type '${key.keyType}'.`);
    }
    return supportedSignatureSuites[0].proofType;
}
function addSecondsToDate(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
}
function dateToSeconds(date) {
    return Math.floor(date.getTime() / 1000);
}
//# sourceMappingURL=utils.js.map