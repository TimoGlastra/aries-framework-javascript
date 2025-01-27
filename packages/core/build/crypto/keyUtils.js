"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSeed = isValidSeed;
exports.isValidPrivateKey = isValidPrivateKey;
exports.isSigningSupportedForKeyType = isSigningSupportedForKeyType;
exports.isEncryptionSupportedForKeyType = isEncryptionSupportedForKeyType;
const utils_1 = require("../utils");
const KeyType_1 = require("./KeyType");
function isValidSeed(seed, keyType) {
    const minimumSeedLength = {
        [KeyType_1.KeyType.Ed25519]: 32,
        [KeyType_1.KeyType.X25519]: 32,
        [KeyType_1.KeyType.Bls12381g1]: 32,
        [KeyType_1.KeyType.Bls12381g2]: 32,
        [KeyType_1.KeyType.Bls12381g1g2]: 32,
        [KeyType_1.KeyType.P256]: 64,
        [KeyType_1.KeyType.P384]: 64,
        [KeyType_1.KeyType.P521]: 64,
        [KeyType_1.KeyType.K256]: 64,
    };
    return utils_1.Buffer.isBuffer(seed) && seed.length >= minimumSeedLength[keyType];
}
function isValidPrivateKey(privateKey, keyType) {
    const privateKeyLength = {
        [KeyType_1.KeyType.Ed25519]: 32,
        [KeyType_1.KeyType.X25519]: 32,
        [KeyType_1.KeyType.Bls12381g1]: 32,
        [KeyType_1.KeyType.Bls12381g2]: 32,
        [KeyType_1.KeyType.Bls12381g1g2]: 32,
        [KeyType_1.KeyType.P256]: 32,
        [KeyType_1.KeyType.P384]: 48,
        [KeyType_1.KeyType.P521]: 66,
        [KeyType_1.KeyType.K256]: 32,
    };
    return utils_1.Buffer.isBuffer(privateKey) && privateKey.length === privateKeyLength[keyType];
}
function isSigningSupportedForKeyType(keyType) {
    const keyTypeSigningSupportedMapping = {
        [KeyType_1.KeyType.Ed25519]: true,
        [KeyType_1.KeyType.X25519]: false,
        [KeyType_1.KeyType.P256]: true,
        [KeyType_1.KeyType.P384]: true,
        [KeyType_1.KeyType.P521]: true,
        [KeyType_1.KeyType.Bls12381g1]: true,
        [KeyType_1.KeyType.Bls12381g2]: true,
        [KeyType_1.KeyType.Bls12381g1g2]: true,
        [KeyType_1.KeyType.K256]: true,
    };
    return keyTypeSigningSupportedMapping[keyType];
}
function isEncryptionSupportedForKeyType(keyType) {
    const keyTypeEncryptionSupportedMapping = {
        [KeyType_1.KeyType.Ed25519]: false,
        [KeyType_1.KeyType.X25519]: true,
        [KeyType_1.KeyType.P256]: true,
        [KeyType_1.KeyType.P384]: true,
        [KeyType_1.KeyType.P521]: true,
        [KeyType_1.KeyType.Bls12381g1]: false,
        [KeyType_1.KeyType.Bls12381g2]: false,
        [KeyType_1.KeyType.Bls12381g1g2]: false,
        [KeyType_1.KeyType.K256]: true,
    };
    return keyTypeEncryptionSupportedMapping[keyType];
}
//# sourceMappingURL=keyUtils.js.map