"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCredentialOfferV1Draft13 = void 0;
exports.getSupportedJwaSignatureAlgorithms = getSupportedJwaSignatureAlgorithms;
exports.getVerifyJwtCallback = getVerifyJwtCallback;
exports.getCreateJwtCallback = getCreateJwtCallback;
exports.openIdTokenIssuerToJwtIssuer = openIdTokenIssuerToJwtIssuer;
exports.getProofTypeFromKey = getProofTypeFromKey;
const core_1 = require("@credo-ts/core");
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
async function getKeyFromDid(agentContext, didUrl) {
    const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
    const didDocument = await didsApi.resolveDidDocument(didUrl);
    const verificationMethod = didDocument.dereferenceKey(didUrl, ['authentication']);
    return (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
}
function getVerifyJwtCallback(agentContext) {
    return async (jwtVerifier, jwt) => {
        const jwsService = agentContext.dependencyManager.resolve(core_1.JwsService);
        if (jwtVerifier.method === 'did') {
            const key = await getKeyFromDid(agentContext, jwtVerifier.didUrl);
            const jwk = (0, core_1.getJwkFromKey)(key);
            const res = await jwsService.verifyJws(agentContext, { jws: jwt.raw, jwkResolver: () => jwk });
            return res.isValid;
        }
        else if (jwtVerifier.method === 'x5c' || jwtVerifier.method === 'jwk') {
            const res = await jwsService.verifyJws(agentContext, { jws: jwt.raw });
            return res.isValid;
        }
        else {
            throw new Error(`Unsupported jwt verifier method: '${jwtVerifier.method}'`);
        }
    };
}
function getCreateJwtCallback(agentContext) {
    return async (jwtIssuer, jwt) => {
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
        else if (jwtIssuer.method === 'jwk') {
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
        else if (jwtIssuer.method === 'x5c') {
            const leafCertificate = core_1.X509Service.getLeafCertificate(agentContext, { certificateChain: jwtIssuer.x5c });
            const jws = await jwsService.createJwsCompact(agentContext, {
                protectedHeaderOptions: Object.assign(Object.assign({}, jwt.header), { alg: jwtIssuer.alg, jwk: undefined }),
                payload: core_1.JwtPayload.fromJson(jwt.payload),
                key: leafCertificate.publicKey,
            });
            return jws;
        }
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
    else if (openId4VcTokenIssuer.method === 'x5c') {
        const leafCertificate = core_1.X509Service.getLeafCertificate(agentContext, {
            certificateChain: openId4VcTokenIssuer.x5c,
        });
        const jwk = (0, core_1.getJwkFromKey)(leafCertificate.publicKey);
        const alg = jwk.supportedSignatureAlgorithms[0];
        if (!alg) {
            throw new core_1.CredoError(`No supported signature algorithms found key type: '${jwk.keyType}'`);
        }
        return Object.assign(Object.assign({}, openId4VcTokenIssuer), { alg });
    }
    else if (openId4VcTokenIssuer.method === 'jwk') {
        const alg = openId4VcTokenIssuer.jwk.supportedSignatureAlgorithms[0];
        if (!alg) {
            throw new core_1.CredoError(`No supported signature algorithms for key type: '${openId4VcTokenIssuer.jwk.keyType}'`);
        }
        return Object.assign(Object.assign({}, openId4VcTokenIssuer), { jwk: openId4VcTokenIssuer.jwk.toJson(), alg });
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
const isCredentialOfferV1Draft13 = (credentialOffer) => {
    return 'credential_configuration_ids' in credentialOffer;
};
exports.isCredentialOfferV1Draft13 = isCredentialOfferV1Draft13;
//# sourceMappingURL=utils.js.map