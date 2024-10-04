"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredoWalletWebCrypto = void 0;
const asn1_schema_1 = require("@peculiar/asn1-schema");
const asn1_x509_1 = require("@peculiar/asn1-x509");
const utils_1 = require("../../utils");
const Key_1 = require("../Key");
const jose_1 = require("../jose");
const CredoWebCryptoKey_1 = require("./CredoWebCryptoKey");
const utils_2 = require("./utils");
class CredoWalletWebCrypto {
    constructor(agentContext) {
        this.agentContext = agentContext;
    }
    generateRandomValues(array) {
        if (!array)
            return array;
        return this.agentContext.wallet.getRandomValues(array.byteLength);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async sign(key, message, _algorithm) {
        const signature = await this.agentContext.wallet.sign({
            key: key.key,
            data: utils_1.Buffer.from(message),
        });
        return signature;
    }
    async verify(key, _algorithm, message, signature) {
        const isValidSignature = await this.agentContext.wallet.verify({
            key: key.key,
            signature: utils_1.Buffer.from(signature),
            data: utils_1.Buffer.from(message),
        });
        return isValidSignature;
    }
    async generate(algorithm) {
        const keyType = (0, utils_2.cryptoKeyAlgorithmToCredoKeyType)(algorithm);
        const key = await this.agentContext.wallet.createKey({
            keyType,
        });
        return key;
    }
    async importKey(format, keyData, algorithm, extractable, keyUsages) {
        if (format === 'jwk' && keyData instanceof Uint8Array) {
            throw new Error('JWK format is only allowed with a jwk as key data');
        }
        if (format !== 'jwk' && !(keyData instanceof Uint8Array)) {
            throw new Error('non-jwk formats are only allowed with a uint8array as key data');
        }
        switch (format.toLowerCase()) {
            case 'jwk': {
                const jwk = (0, jose_1.getJwkFromJson)(keyData);
                const publicKey = Key_1.Key.fromPublicKey(jwk.publicKey, jwk.keyType);
                return new CredoWebCryptoKey_1.CredoWebCryptoKey(publicKey, algorithm, extractable, 'public', keyUsages);
            }
            case 'spki': {
                const subjectPublicKey = asn1_schema_1.AsnParser.parse(keyData, asn1_x509_1.SubjectPublicKeyInfo);
                const key = new Uint8Array(subjectPublicKey.subjectPublicKey);
                const keyType = (0, utils_2.spkiAlgorithmIntoCredoKeyType)(subjectPublicKey.algorithm);
                return new CredoWebCryptoKey_1.CredoWebCryptoKey(Key_1.Key.fromPublicKey(key, keyType), algorithm, extractable, 'public', keyUsages);
            }
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    async exportKey(format, key) {
        switch (format.toLowerCase()) {
            case 'jwk': {
                const jwk = (0, jose_1.getJwkFromKey)(key.key);
                return jwk.toJson();
            }
            case 'spki': {
                const algorithm = (0, utils_2.credoKeyTypeIntoSpkiAlgorithm)(key.key.keyType);
                const publicKeyInfo = new asn1_x509_1.SubjectPublicKeyInfo({
                    algorithm,
                    subjectPublicKey: key.key.publicKey.buffer,
                });
                const derEncoded = asn1_schema_1.AsnConvert.serialize(publicKeyInfo);
                return new Uint8Array(derEncoded);
            }
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}
exports.CredoWalletWebCrypto = CredoWalletWebCrypto;
//# sourceMappingURL=CredoWalletWebCrypto.js.map