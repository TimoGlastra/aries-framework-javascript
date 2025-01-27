"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Certificate = exports.KeyUsage = void 0;
const asn1_schema_1 = require("@peculiar/asn1-schema");
const asn1_x509_1 = require("@peculiar/asn1-x509");
const x509 = __importStar(require("@peculiar/x509"));
const Key_1 = require("../../crypto/Key");
const KeyType_1 = require("../../crypto/KeyType");
const ecCompression_1 = require("../../crypto/jose/jwk/ecCompression");
const webcrypto_1 = require("../../crypto/webcrypto");
const utils_1 = require("../../crypto/webcrypto/utils");
const utils_2 = require("../../utils");
const X509Error_1 = require("./X509Error");
var KeyUsage;
(function (KeyUsage) {
    KeyUsage[KeyUsage["DigitalSignature"] = 1] = "DigitalSignature";
    KeyUsage[KeyUsage["NonRepudiation"] = 2] = "NonRepudiation";
    KeyUsage[KeyUsage["KeyEncipherment"] = 4] = "KeyEncipherment";
    KeyUsage[KeyUsage["DataEncipherment"] = 8] = "DataEncipherment";
    KeyUsage[KeyUsage["KeyAgreement"] = 16] = "KeyAgreement";
    KeyUsage[KeyUsage["KeyCertSign"] = 32] = "KeyCertSign";
    KeyUsage[KeyUsage["CrlSign"] = 64] = "CrlSign";
    KeyUsage[KeyUsage["EncipherOnly"] = 128] = "EncipherOnly";
    KeyUsage[KeyUsage["DecipherOnly"] = 256] = "DecipherOnly";
})(KeyUsage || (exports.KeyUsage = KeyUsage = {}));
class X509Certificate {
    constructor(options) {
        this.extensions = options.extensions;
        this.publicKey = options.publicKey;
        this.privateKey = options.privateKey;
        this.rawCertificate = options.rawCertificate;
    }
    static fromRawCertificate(rawCertificate) {
        const certificate = new x509.X509Certificate(rawCertificate);
        return this.parseCertificate(certificate);
    }
    static fromEncodedCertificate(encodedCertificate) {
        const certificate = new x509.X509Certificate(encodedCertificate);
        return this.parseCertificate(certificate);
    }
    static parseCertificate(certificate) {
        const publicKey = asn1_schema_1.AsnParser.parse(certificate.publicKey.rawData, asn1_x509_1.SubjectPublicKeyInfo);
        const privateKey = certificate.privateKey ? new Uint8Array(certificate.privateKey.rawData) : undefined;
        const keyType = (0, utils_1.spkiAlgorithmIntoCredoKeyType)(publicKey.algorithm);
        // TODO(crypto): Currently this only does point-compression for P256.
        //               We should either store all keys as uncompressed, or we should compress all supported keys here correctly
        let keyBytes = new Uint8Array(publicKey.subjectPublicKey);
        if (publicKey.subjectPublicKey.byteLength === 65 && keyType === KeyType_1.KeyType.P256) {
            if (keyBytes[0] !== 0x04) {
                throw new X509Error_1.X509Error('Received P256 key with 65 bytes, but key did not start with 0x04. Invalid key');
            }
            // TODO(crypto): the compress method is bugged because it does not expect the required `0x04` prefix. Here we strip that and receive the expected result
            keyBytes = (0, ecCompression_1.compress)(keyBytes.slice(1));
        }
        const key = new Key_1.Key(keyBytes, keyType);
        const extensions = certificate.extensions
            .map((e) => {
            if (e instanceof x509.AuthorityKeyIdentifierExtension) {
                return { [e.type]: { keyId: e.keyId } };
            }
            else if (e instanceof x509.SubjectKeyIdentifierExtension) {
                return { [e.type]: { keyId: e.keyId } };
            }
            else if (e instanceof x509.SubjectAlternativeNameExtension) {
                return { [e.type]: JSON.parse(JSON.stringify(e.names)) };
            }
            else if (e instanceof x509.KeyUsagesExtension) {
                return { [e.type]: { usage: e.usages } };
            }
            // TODO: We could throw an error when we don't understand the extension?
            // This will break everytime we do not understand an extension though
            return undefined;
        })
            .filter((e) => e !== undefined);
        return new X509Certificate({
            publicKey: key,
            privateKey,
            extensions,
            rawCertificate: new Uint8Array(certificate.rawData),
        });
    }
    getMatchingExtensions(objectIdentifier) {
        var _a, _b;
        return (_b = (_a = this.extensions) === null || _a === void 0 ? void 0 : _a.map((e) => e[objectIdentifier])) === null || _b === void 0 ? void 0 : _b.filter(Boolean);
    }
    get sanDnsNames() {
        var _a, _b, _c;
        const san = this.getMatchingExtensions(asn1_x509_1.id_ce_subjectAltName);
        return ((_c = (_b = (_a = san === null || san === void 0 ? void 0 : san.flatMap((e) => e)) === null || _a === void 0 ? void 0 : _a.filter((e) => e.type === 'dns')) === null || _b === void 0 ? void 0 : _b.map((e) => e.value)) !== null && _c !== void 0 ? _c : []);
    }
    get sanUriNames() {
        var _a, _b, _c;
        const san = this.getMatchingExtensions(asn1_x509_1.id_ce_subjectAltName);
        return ((_c = (_b = (_a = san === null || san === void 0 ? void 0 : san.flatMap((e) => e)) === null || _a === void 0 ? void 0 : _a.filter((e) => e.type === 'url')) === null || _b === void 0 ? void 0 : _b.map((e) => e.value)) !== null && _c !== void 0 ? _c : []);
    }
    get authorityKeyIdentifier() {
        var _a;
        const keyIds = (_a = this.getMatchingExtensions(asn1_x509_1.id_ce_authorityKeyIdentifier)) === null || _a === void 0 ? void 0 : _a.map((e) => e.keyId);
        if (keyIds && keyIds.length > 1) {
            throw new X509Error_1.X509Error('Multiple Authority Key Identifiers are not allowed');
        }
        return keyIds === null || keyIds === void 0 ? void 0 : keyIds[0];
    }
    get subjectKeyIdentifier() {
        var _a;
        const keyIds = (_a = this.getMatchingExtensions(asn1_x509_1.id_ce_subjectKeyIdentifier)) === null || _a === void 0 ? void 0 : _a.map((e) => e.keyId);
        if (keyIds && keyIds.length > 1) {
            throw new X509Error_1.X509Error('Multiple Subject Key Identifiers are not allowed');
        }
        return keyIds === null || keyIds === void 0 ? void 0 : keyIds[0];
    }
    get keyUsage() {
        var _a;
        const keyUsages = (_a = this.getMatchingExtensions(asn1_x509_1.id_ce_keyUsage)) === null || _a === void 0 ? void 0 : _a.map((e) => e.usage);
        if (keyUsages && keyUsages.length > 1) {
            throw new X509Error_1.X509Error('Multiple Key Usages are not allowed');
        }
        if (keyUsages) {
            return Object.values(KeyUsage)
                .filter((key) => typeof key === 'number')
                .filter((flagValue) => (keyUsages[0] & flagValue) === flagValue)
                .map((flagValue) => flagValue);
        }
        return [];
    }
    static async createSelfSigned({ key, extensions, notAfter, notBefore, name, includeAuthorityKeyIdentifier = true, }, webCrypto) {
        const cryptoKeyAlgorithm = (0, utils_1.credoKeyTypeIntoCryptoKeyAlgorithm)(key.keyType);
        const publicKey = new webcrypto_1.CredoWebCryptoKey(key, cryptoKeyAlgorithm, true, 'public', ['verify']);
        const privateKey = new webcrypto_1.CredoWebCryptoKey(key, cryptoKeyAlgorithm, false, 'private', ['sign']);
        const hexPublicKey = utils_2.TypedArrayEncoder.toHex(key.publicKey);
        const x509Extensions = [
            new x509.SubjectKeyIdentifierExtension(hexPublicKey),
            new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature | x509.KeyUsageFlags.keyCertSign),
        ];
        if (includeAuthorityKeyIdentifier) {
            x509Extensions.push(new x509.AuthorityKeyIdentifierExtension(hexPublicKey));
        }
        for (const extension of extensions !== null && extensions !== void 0 ? extensions : []) {
            x509Extensions.push(new x509.SubjectAlternativeNameExtension(extension));
        }
        const certificate = await x509.X509CertificateGenerator.createSelfSigned({
            keys: { publicKey, privateKey },
            name,
            extensions: x509Extensions,
            notAfter,
            notBefore,
        }, webCrypto);
        return X509Certificate.parseCertificate(certificate);
    }
    get subject() {
        const certificate = new x509.X509Certificate(this.rawCertificate);
        return certificate.subject;
    }
    async verify({ verificationDate = new Date(), publicKey }, webCrypto) {
        const certificate = new x509.X509Certificate(this.rawCertificate);
        let publicCryptoKey;
        if (publicKey) {
            const cryptoKeyAlgorithm = (0, utils_1.credoKeyTypeIntoCryptoKeyAlgorithm)(publicKey.keyType);
            publicCryptoKey = new webcrypto_1.CredoWebCryptoKey(publicKey, cryptoKeyAlgorithm, true, 'public', ['verify']);
        }
        // We use the library to validate the signature, but the date is manually verified
        const isSignatureValid = await certificate.verify({ signatureOnly: true, publicKey: publicCryptoKey }, webCrypto);
        const time = verificationDate.getTime();
        const isNotBeforeValid = certificate.notBefore.getTime() <= time;
        const isNotAfterValid = time <= certificate.notAfter.getTime();
        if (!isSignatureValid) {
            throw new X509Error_1.X509Error(`Certificate: '${certificate.subject}' has an invalid signature`);
        }
        if (!isNotBeforeValid) {
            throw new X509Error_1.X509Error(`Certificate: '${certificate.subject}' used before it is allowed`);
        }
        if (!isNotAfterValid) {
            throw new X509Error_1.X509Error(`Certificate: '${certificate.subject}' used after it is allowed`);
        }
    }
    async getData(crypto) {
        const certificate = new x509.X509Certificate(this.rawCertificate);
        const thumbprint = await certificate.getThumbprint(crypto);
        const thumbprintHex = utils_2.TypedArrayEncoder.toHex(new Uint8Array(thumbprint));
        return {
            issuerName: certificate.issuerName.toString(),
            subjectName: certificate.subjectName.toString(),
            serialNumber: certificate.serialNumber,
            thumbprint: thumbprintHex,
            pem: certificate.toString(),
            notBefore: certificate.notBefore,
            notAfter: certificate.notAfter,
        };
    }
    getIssuerNameField(field) {
        const certificate = new x509.X509Certificate(this.rawCertificate);
        return certificate.issuerName.getField(field);
    }
    toString(format) {
        const certificate = new x509.X509Certificate(this.rawCertificate);
        return certificate.toString(format);
    }
    equal(certificate) {
        const parsedThis = new x509.X509Certificate(this.rawCertificate);
        const parsedOther = new x509.X509Certificate(certificate.rawCertificate);
        return parsedThis.equal(parsedOther);
    }
}
exports.X509Certificate = X509Certificate;
//# sourceMappingURL=X509Certificate.js.map