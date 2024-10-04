"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_METHOD_TYPE_MULTIKEY = void 0;
exports.getMultikey = getMultikey;
exports.isMultikey = isMultikey;
exports.getKeyFromMultikey = getKeyFromMultikey;
const Key_1 = require("../../../../crypto/Key");
const error_1 = require("../../../../error");
exports.VERIFICATION_METHOD_TYPE_MULTIKEY = 'Multikey';
/**
 * Get a Multikey verification method.
 */
function getMultikey({ did, key, verificationMethodId }) {
    if (!verificationMethodId) {
        verificationMethodId = `${did}#${key.fingerprint}`;
    }
    return {
        id: verificationMethodId,
        type: exports.VERIFICATION_METHOD_TYPE_MULTIKEY,
        controller: did,
        publicKeyMultibase: key.fingerprint,
    };
}
/**
 * Check whether a verification method is a Multikey verification method.
 */
function isMultikey(verificationMethod) {
    return verificationMethod.type === exports.VERIFICATION_METHOD_TYPE_MULTIKEY;
}
/**
 * Get a key from a Multikey verification method.
 */
function getKeyFromMultikey(verificationMethod) {
    if (!verificationMethod.publicKeyMultibase) {
        throw new error_1.CredoError(`Missing publicKeyMultibase on verification method with type ${exports.VERIFICATION_METHOD_TYPE_MULTIKEY}`);
    }
    return Key_1.Key.fromFingerprint(verificationMethod.publicKeyMultibase);
}
//# sourceMappingURL=Multikey.js.map