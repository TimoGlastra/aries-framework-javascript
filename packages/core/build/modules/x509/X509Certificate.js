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
exports.X509Certificate = void 0;
const asn1_schema_1 = require("@peculiar/asn1-schema");
const asn1_x509_1 = require("@peculiar/asn1-x509");
const x509 = __importStar(require("@peculiar/x509"));
const Key_1 = require("../../crypto/Key");
const webcrypto_1 = require("../../crypto/webcrypto");
const utils_1 = require("../../crypto/webcrypto/utils");
const X509Error_1 = require("./X509Error");
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
        var _a;
        const publicKey = asn1_schema_1.AsnParser.parse(certificate.publicKey.rawData, asn1_x509_1.SubjectPublicKeyInfo);
        const privateKey = certificate.privateKey ? new Uint8Array(certificate.privateKey.rawData) : undefined;
        const keyType = (0, utils_1.spkiAlgorithmIntoCredoKeyType)(publicKey.algorithm);
        const key = new Key_1.Key(new Uint8Array(publicKey.subjectPublicKey), keyType);
        return new X509Certificate({
            publicKey: key,
            privateKey,
            extensions: (_a = certificate.extensions) === null || _a === void 0 ? void 0 : _a.map((e) => JSON.parse(JSON.stringify(e))).map((e) => ({ [e.type]: e.names })),
            rawCertificate: new Uint8Array(certificate.rawData),
        });
    }
    getMatchingExtensions(name, type) {
        var _a, _b, _c, _d;
        const extensionsWithName = (_d = (_c = (_b = (_a = this.extensions) === null || _a === void 0 ? void 0 : _a.filter((e) => e[name])) === null || _b === void 0 ? void 0 : _b.flatMap((e) => e[name])) === null || _c === void 0 ? void 0 : _c.filter((e) => e !== undefined && e.type === type)) === null || _d === void 0 ? void 0 : _d.map((e) => e.value);
        return extensionsWithName;
    }
    get sanDnsNames() {
        var _a;
        const subjectAlternativeNameExtensionDns = this.getMatchingExtensions(asn1_x509_1.id_ce_subjectAltName, 'dns');
        return (_a = subjectAlternativeNameExtensionDns === null || subjectAlternativeNameExtensionDns === void 0 ? void 0 : subjectAlternativeNameExtensionDns.filter((e) => typeof e === 'string')) !== null && _a !== void 0 ? _a : [];
    }
    get sanUriNames() {
        var _a;
        const subjectAlternativeNameExtensionUri = this.getMatchingExtensions(asn1_x509_1.id_ce_subjectAltName, 'url');
        return (_a = subjectAlternativeNameExtensionUri === null || subjectAlternativeNameExtensionUri === void 0 ? void 0 : subjectAlternativeNameExtensionUri.filter((e) => typeof e === 'string')) !== null && _a !== void 0 ? _a : [];
    }
    static async createSelfSigned({ key, extensions, notAfter, notBefore, name, }, webCrypto) {
        const cryptoKeyAlgorithm = (0, utils_1.credoKeyTypeIntoCryptoKeyAlgorithm)(key.keyType);
        const publicKey = new webcrypto_1.CredoWebCryptoKey(key, cryptoKeyAlgorithm, true, 'public', ['verify']);
        const privateKey = new webcrypto_1.CredoWebCryptoKey(key, cryptoKeyAlgorithm, false, 'private', ['sign']);
        const certificate = await x509.X509CertificateGenerator.createSelfSigned({
            keys: { publicKey, privateKey },
            name,
            extensions: extensions === null || extensions === void 0 ? void 0 : extensions.map((extension) => new x509.SubjectAlternativeNameExtension(extension)),
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