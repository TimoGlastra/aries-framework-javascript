"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credoKeyTypeIntoSpkiAlgorithm = exports.spkiAlgorithmIntoCredoKeyType = exports.cryptoKeyAlgorithmToCredoKeyType = exports.credoKeyTypeIntoCryptoKeyAlgorithm = void 0;
const KeyType_1 = require("../../KeyType");
const CredoWebCryptoError_1 = require("../CredoWebCryptoError");
const algorithmIdentifiers_1 = require("../algorithmIdentifiers");
const credoKeyTypeIntoCryptoKeyAlgorithm = (keyType) => {
    switch (keyType) {
        case KeyType_1.KeyType.Ed25519:
            return { name: 'Ed25519' };
        case KeyType_1.KeyType.P256:
            return { name: 'ECDSA', namedCurve: 'P-256' };
        case KeyType_1.KeyType.P384:
            return { name: 'ECDSA', namedCurve: 'P-384' };
        case KeyType_1.KeyType.K256:
            return { name: 'ECDSA', namedCurve: 'K-256' };
        default:
            throw new CredoWebCryptoError_1.CredoWebCryptoError(`Unsupported key type: ${keyType}`);
    }
};
exports.credoKeyTypeIntoCryptoKeyAlgorithm = credoKeyTypeIntoCryptoKeyAlgorithm;
const cryptoKeyAlgorithmToCredoKeyType = (algorithm) => {
    const algorithmName = algorithm.name.toUpperCase();
    switch (algorithmName) {
        case 'ED25519':
            return KeyType_1.KeyType.Ed25519;
        case 'X25519':
            return KeyType_1.KeyType.X25519;
        case 'ECDSA':
            switch (algorithm.namedCurve.toUpperCase()) {
                case 'P-256':
                    return KeyType_1.KeyType.P256;
                case 'P-384':
                    return KeyType_1.KeyType.P384;
                case 'K-256':
                    return KeyType_1.KeyType.K256;
                default:
                    throw new CredoWebCryptoError_1.CredoWebCryptoError(`Unsupported curve for ECDSA: ${algorithm.namedCurve}`);
            }
    }
    throw new CredoWebCryptoError_1.CredoWebCryptoError(`Unsupported algorithm: ${algorithmName}`);
};
exports.cryptoKeyAlgorithmToCredoKeyType = cryptoKeyAlgorithmToCredoKeyType;
const spkiAlgorithmIntoCredoKeyType = (algorithm) => {
    if (algorithm.isEqual(algorithmIdentifiers_1.ecPublicKeyWithP256AlgorithmIdentifier)) {
        return KeyType_1.KeyType.P256;
    }
    else if (algorithm.isEqual(algorithmIdentifiers_1.ecPublicKeyWithP384AlgorithmIdentifier)) {
        return KeyType_1.KeyType.P384;
    }
    else if (algorithm.isEqual(algorithmIdentifiers_1.ecPublicKeyWithK256AlgorithmIdentifier)) {
        return KeyType_1.KeyType.K256;
    }
    else if (algorithm.isEqual(algorithmIdentifiers_1.ed25519AlgorithmIdentifier)) {
        return KeyType_1.KeyType.Ed25519;
    }
    else if (algorithm.isEqual(algorithmIdentifiers_1.x25519AlgorithmIdentifier)) {
        return KeyType_1.KeyType.X25519;
    }
    throw new CredoWebCryptoError_1.CredoWebCryptoError(`Unsupported algorithm: ${algorithm.algorithm}, with params: ${algorithm.parameters ? 'yes' : 'no'}`);
};
exports.spkiAlgorithmIntoCredoKeyType = spkiAlgorithmIntoCredoKeyType;
const credoKeyTypeIntoSpkiAlgorithm = (keyType) => {
    switch (keyType) {
        case KeyType_1.KeyType.Ed25519:
            return algorithmIdentifiers_1.ed25519AlgorithmIdentifier;
        case KeyType_1.KeyType.X25519:
            return algorithmIdentifiers_1.x25519AlgorithmIdentifier;
        case KeyType_1.KeyType.P256:
            return algorithmIdentifiers_1.ecPublicKeyWithP256AlgorithmIdentifier;
        case KeyType_1.KeyType.P384:
            return algorithmIdentifiers_1.ecPublicKeyWithP384AlgorithmIdentifier;
        case KeyType_1.KeyType.K256:
            return algorithmIdentifiers_1.ecPublicKeyWithK256AlgorithmIdentifier;
        default:
            throw new CredoWebCryptoError_1.CredoWebCryptoError(`Unsupported key type: ${keyType}`);
    }
};
exports.credoKeyTypeIntoSpkiAlgorithm = credoKeyTypeIntoSpkiAlgorithm;
//# sourceMappingURL=keyAlgorithmConversion.js.map