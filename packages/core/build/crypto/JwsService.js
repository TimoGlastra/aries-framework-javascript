"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwsService = void 0;
const error_1 = require("../error");
const x509_1 = require("../modules/x509");
const plugins_1 = require("../plugins");
const utils_1 = require("../utils");
const error_2 = require("../wallet/error");
const X509Service_1 = require("./../modules/x509/X509Service");
const JwsTypes_1 = require("./JwsTypes");
const jwk_1 = require("./jose/jwk");
const jwt_1 = require("./jose/jwt");
let JwsService = class JwsService {
    async createJwsBase(agentContext, options) {
        const { jwk, alg, x5c } = options.protectedHeaderOptions;
        const keyJwk = (0, jwk_1.getJwkFromKey)(options.key);
        // Make sure the options.x5c and x5c from protectedHeader are the same.
        if (x5c) {
            const certificate = X509Service_1.X509Service.getLeafCertificate(agentContext, { certificateChain: x5c });
            if (certificate.publicKey.keyType !== options.key.keyType ||
                !certificate.publicKey.publicKey.equals(options.key.publicKey)) {
                throw new error_1.CredoError(`Protected header x5c does not match key for signing.`);
            }
        }
        // Make sure the options.key and jwk from protectedHeader are the same.
        if (jwk && (jwk.key.keyType !== options.key.keyType || !jwk.key.publicKey.equals(options.key.publicKey))) {
            throw new error_1.CredoError(`Protected header JWK does not match key for signing.`);
        }
        // Validate the options.key used for signing against the jws options
        // We use keyJwk instead of jwk, as the user could also use kid instead of jwk
        if (keyJwk && !keyJwk.supportsSignatureAlgorithm(alg)) {
            throw new error_1.CredoError(`alg '${alg}' is not a valid JWA signature algorithm for this jwk with keyType ${keyJwk.keyType}. Supported algorithms are ${keyJwk.supportedSignatureAlgorithms.join(', ')}`);
        }
        const payload = options.payload instanceof jwt_1.JwtPayload ? utils_1.JsonEncoder.toBuffer(options.payload.toJson()) : options.payload;
        const base64Payload = utils_1.TypedArrayEncoder.toBase64URL(payload);
        const base64UrlProtectedHeader = utils_1.JsonEncoder.toBase64URL(this.buildProtected(options.protectedHeaderOptions));
        const signature = utils_1.TypedArrayEncoder.toBase64URL(await agentContext.wallet.sign({
            data: utils_1.TypedArrayEncoder.fromString(`${base64UrlProtectedHeader}.${base64Payload}`),
            key: options.key,
        }));
        return {
            base64Payload,
            base64UrlProtectedHeader,
            signature,
        };
    }
    async createJws(agentContext, { payload, key, header, protectedHeaderOptions }) {
        const { base64UrlProtectedHeader, signature, base64Payload } = await this.createJwsBase(agentContext, {
            payload,
            key,
            protectedHeaderOptions,
        });
        return {
            protected: base64UrlProtectedHeader,
            signature,
            header,
            payload: base64Payload,
        };
    }
    /**
     *  @see {@link https://www.rfc-editor.org/rfc/rfc7515#section-3.1}
     * */
    async createJwsCompact(agentContext, { payload, key, protectedHeaderOptions }) {
        const { base64Payload, base64UrlProtectedHeader, signature } = await this.createJwsBase(agentContext, {
            payload,
            key,
            protectedHeaderOptions,
        });
        return `${base64UrlProtectedHeader}.${base64Payload}.${signature}`;
    }
    /**
     * Verify a JWS
     */
    async verifyJws(agentContext, { jws, jwkResolver, trustedCertificates }) {
        let signatures = [];
        let payload;
        if (typeof jws === 'string') {
            if (!JwsTypes_1.JWS_COMPACT_FORMAT_MATCHER.test(jws))
                throw new error_1.CredoError(`Invalid JWS compact format for value '${jws}'.`);
            const [protectedHeader, _payload, signature] = jws.split('.');
            payload = _payload;
            signatures.push({
                header: {},
                protected: protectedHeader,
                signature,
            });
        }
        else if ('signatures' in jws) {
            signatures = jws.signatures;
            payload = jws.payload;
        }
        else {
            signatures.push(jws);
            payload = jws.payload;
        }
        if (signatures.length === 0) {
            throw new error_1.CredoError('Unable to verify JWS, no signatures present in JWS.');
        }
        const jwsFlattened = {
            signatures,
            payload,
        };
        const signerKeys = [];
        for (const jws of signatures) {
            const protectedJson = utils_1.JsonEncoder.fromBase64(jws.protected);
            if (!(0, utils_1.isJsonObject)(protectedJson)) {
                throw new error_1.CredoError('Unable to verify JWS, protected header is not a valid JSON object.');
            }
            if (!protectedJson.alg || typeof protectedJson.alg !== 'string') {
                throw new error_1.CredoError('Unable to verify JWS, protected header alg is not provided or not a string.');
            }
            const jwk = await this.jwkFromJws(agentContext, {
                jws,
                payload,
                protectedHeader: Object.assign(Object.assign({}, protectedJson), { alg: protectedJson.alg }),
                jwkResolver,
                trustedCertificates,
            });
            if (!jwk.supportsSignatureAlgorithm(protectedJson.alg)) {
                throw new error_1.CredoError(`alg '${protectedJson.alg}' is not a valid JWA signature algorithm for this jwk with keyType ${jwk.keyType}. Supported algorithms are ${jwk.supportedSignatureAlgorithms.join(', ')}`);
            }
            const data = utils_1.TypedArrayEncoder.fromString(`${jws.protected}.${payload}`);
            const signature = utils_1.TypedArrayEncoder.fromBase64(jws.signature);
            signerKeys.push(jwk.key);
            try {
                const isValid = await agentContext.wallet.verify({ key: jwk.key, data, signature });
                if (!isValid) {
                    return {
                        isValid: false,
                        signerKeys: [],
                        jws: jwsFlattened,
                    };
                }
            }
            catch (error) {
                // WalletError probably means signature verification failed. Would be useful to add
                // more specific error type in wallet.verify method
                if (error instanceof error_2.WalletError) {
                    return {
                        isValid: false,
                        signerKeys: [],
                        jws: jwsFlattened,
                    };
                }
                throw error;
            }
        }
        return { isValid: true, signerKeys, jws: jwsFlattened };
    }
    buildProtected(options) {
        var _a;
        if ([options.jwk, options.kid, options.x5c].filter(Boolean).length != 1) {
            throw new error_1.CredoError('Only one of JWK, kid or x5c can and must be provided.');
        }
        return Object.assign(Object.assign({}, options), { alg: options.alg, jwk: (_a = options.jwk) === null || _a === void 0 ? void 0 : _a.toJson(), kid: options.kid });
    }
    async jwkFromJws(agentContext, options) {
        var _a;
        const { protectedHeader, jwkResolver, jws, payload, trustedCertificates: trustedCertificatesFromOptions = [], } = options;
        if ([protectedHeader.jwk, protectedHeader.kid, protectedHeader.x5c].filter(Boolean).length > 1) {
            throw new error_1.CredoError('Only one of jwk, kid and x5c headers can and must be provided.');
        }
        if (protectedHeader.x5c) {
            if (!Array.isArray(protectedHeader.x5c) ||
                protectedHeader.x5c.some((certificate) => typeof certificate !== 'string')) {
                throw new error_1.CredoError('x5c header is not a valid JSON array of string.');
            }
            const trustedCertificatesFromConfig = (_a = agentContext.dependencyManager.resolve(x509_1.X509ModuleConfig).trustedCertificates) !== null && _a !== void 0 ? _a : [];
            const trustedCertificates = trustedCertificatesFromOptions !== null && trustedCertificatesFromOptions !== void 0 ? trustedCertificatesFromOptions : trustedCertificatesFromConfig;
            if (trustedCertificates.length === 0) {
                throw new error_1.CredoError(`trustedCertificates is required when the JWS protected header contains an 'x5c' property.`);
            }
            await X509Service_1.X509Service.validateCertificateChain(agentContext, {
                certificateChain: protectedHeader.x5c,
                trustedCertificates,
            });
            const certificate = X509Service_1.X509Service.getLeafCertificate(agentContext, { certificateChain: protectedHeader.x5c });
            return (0, jwk_1.getJwkFromKey)(certificate.publicKey);
        }
        // Jwk
        if (protectedHeader.jwk) {
            if (!(0, utils_1.isJsonObject)(protectedHeader.jwk))
                throw new error_1.CredoError('JWK is not a valid JSON object.');
            return (0, jwk_1.getJwkFromJson)(protectedHeader.jwk);
        }
        if (!jwkResolver) {
            throw new error_1.CredoError(`jwkResolver is required when the JWS protected header does not contain a 'jwk' property.`);
        }
        try {
            const jwk = await jwkResolver({
                jws,
                protectedHeader,
                payload,
            });
            return jwk;
        }
        catch (error) {
            throw new error_1.CredoError(`Error when resolving JWK for JWS in jwkResolver. ${error.message}`, {
                cause: error,
            });
        }
    }
};
exports.JwsService = JwsService;
exports.JwsService = JwsService = __decorate([
    (0, plugins_1.injectable)()
], JwsService);
//# sourceMappingURL=JwsService.js.map