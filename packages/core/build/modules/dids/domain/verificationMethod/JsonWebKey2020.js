"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020 = void 0;
exports.getJsonWebKey2020 = getJsonWebKey2020;
exports.isJsonWebKey2020 = isJsonWebKey2020;
exports.getKeyFromJsonWebKey2020 = getKeyFromJsonWebKey2020;
const jwk_1 = require("../../../../crypto/jose/jwk");
const error_1 = require("../../../../error");
exports.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020 = 'JsonWebKey2020';
/**
 * Get a JsonWebKey2020 verification method.
 */
function getJsonWebKey2020(options) {
    var _a, _b;
    const jwk = options.jwk ? (0, jwk_1.getJwkFromJson)(options.jwk) : (0, jwk_1.getJwkFromKey)(options.key);
    const verificationMethodId = (_a = options.verificationMethodId) !== null && _a !== void 0 ? _a : `${options.did}#${jwk.key.fingerprint}`;
    return {
        id: verificationMethodId,
        type: exports.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020,
        controller: options.did,
        publicKeyJwk: (_b = options.jwk) !== null && _b !== void 0 ? _b : jwk.toJson(),
    };
}
/**
 * Check whether a verification method is a JsonWebKey2020 verification method.
 */
function isJsonWebKey2020(verificationMethod) {
    return verificationMethod.type === exports.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020;
}
/**
 * Get a key from a JsonWebKey2020 verification method.
 */
function getKeyFromJsonWebKey2020(verificationMethod) {
    if (!verificationMethod.publicKeyJwk) {
        throw new error_1.CredoError(`Missing publicKeyJwk on verification method with type ${exports.VERIFICATION_METHOD_TYPE_JSON_WEB_KEY_2020}`);
    }
    return (0, jwk_1.getJwkFromJson)(verificationMethod.publicKeyJwk).key;
}
//# sourceMappingURL=JsonWebKey2020.js.map