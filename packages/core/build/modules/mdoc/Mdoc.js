"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mdoc = void 0;
const mdoc_1 = require("@animo-id/mdoc");
const crypto_1 = require("../../crypto");
const vc_1 = require("../vc");
const x509_1 = require("../x509");
const utils_1 = require("./../../utils");
const MdocContext_1 = require("./MdocContext");
const MdocError_1 = require("./MdocError");
/**
 * This class represents a IssuerSigned Mdoc Document,
 * which are the actual credentials being issued to holders.
 */
class Mdoc {
    constructor(issuerSignedDocument) {
        this.issuerSignedDocument = issuerSignedDocument;
        const issuerSigned = issuerSignedDocument.prepare().get('issuerSigned');
        this.base64Url = utils_1.TypedArrayEncoder.toBase64URL((0, mdoc_1.cborEncode)(issuerSigned));
    }
    /**
     * claim format is convenience method added to all credential instances
     */
    get claimFormat() {
        return vc_1.ClaimFormat.MsoMdoc;
    }
    /**
     * Encoded is convenience method added to all credential instances
     */
    get encoded() {
        return this.base64Url;
    }
    static fromBase64Url(mdocBase64Url, expectedDocType) {
        const issuerSignedDocument = (0, mdoc_1.parseIssuerSigned)(utils_1.TypedArrayEncoder.fromBase64(mdocBase64Url), expectedDocType);
        return new Mdoc(issuerSignedDocument);
    }
    static fromIssuerSignedDocument(issuerSignedBase64Url, expectedDocType) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Mdoc((0, mdoc_1.parseIssuerSigned)(utils_1.TypedArrayEncoder.fromBase64(issuerSignedBase64Url), expectedDocType));
    }
    static fromDeviceSignedDocument(issuerSignedBase64Url, deviceSignedBase64Url, expectedDocType) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Mdoc((0, mdoc_1.parseDeviceSigned)(utils_1.TypedArrayEncoder.fromBase64(deviceSignedBase64Url), utils_1.TypedArrayEncoder.fromBase64(issuerSignedBase64Url), expectedDocType));
    }
    get docType() {
        return this.issuerSignedDocument.docType;
    }
    /**
     * Get the device key to which the mdoc is bound
     */
    get deviceKey() {
        var _a;
        const deviceKeyRaw = (_a = this.issuerSignedDocument.issuerSigned.issuerAuth.decodedPayload.deviceKeyInfo) === null || _a === void 0 ? void 0 : _a.deviceKey;
        if (!deviceKeyRaw)
            return null;
        return (0, crypto_1.getJwkFromJson)(mdoc_1.COSEKey.import(deviceKeyRaw).toJWK()).key;
    }
    get alg() {
        const algName = this.issuerSignedDocument.issuerSigned.issuerAuth.algName;
        if (!algName) {
            throw new MdocError_1.MdocError('Cannot extract the signature algorithm from the mdoc.');
        }
        if (Object.values(crypto_1.JwaSignatureAlgorithm).includes(algName)) {
            return algName;
        }
        throw new MdocError_1.MdocError(`Cannot parse mdoc. The signature algorithm '${algName}' is not supported.`);
    }
    get validityInfo() {
        return this.issuerSignedDocument.issuerSigned.issuerAuth.decodedPayload.validityInfo;
    }
    get deviceSignedNamespaces() {
        if (this.issuerSignedDocument instanceof mdoc_1.DeviceSignedDocument === false) {
            throw new MdocError_1.MdocError(`Cannot get 'device-namespaces from a IssuerSignedDocument. Must be a DeviceSignedDocument.`);
        }
        return Object.fromEntries(Array.from(this.issuerSignedDocument.allDeviceSignedNamespaces.entries()).map(([namespace, value]) => [
            namespace,
            Object.fromEntries(Array.from(value.entries())),
        ]));
    }
    get issuerSignedCertificateChain() {
        return this.issuerSignedDocument.issuerSigned.issuerAuth.certificateChain;
    }
    get issuerSignedNamespaces() {
        return Object.fromEntries(Array.from(this.issuerSignedDocument.allIssuerSignedNamespaces.entries()).map(([namespace, value]) => [
            namespace,
            Object.fromEntries(Array.from(value.entries())),
        ]));
    }
    static async sign(agentContext, options) {
        const { docType, validityInfo, namespaces, holderKey, issuerCertificate } = options;
        const mdocContext = (0, MdocContext_1.getMdocContext)(agentContext);
        const holderPublicJwk = (0, crypto_1.getJwkFromKey)(holderKey);
        const document = new mdoc_1.Document(docType, mdocContext)
            .useDigestAlgorithm('SHA-256')
            .addValidityInfo(validityInfo)
            .addDeviceKeyInfo({ deviceKey: holderPublicJwk.toJson() });
        for (const [namespace, namespaceRecord] of Object.entries(namespaces)) {
            document.addIssuerNameSpace(namespace, namespaceRecord);
        }
        const cert = x509_1.X509Certificate.fromEncodedCertificate(issuerCertificate);
        const issuerKey = (0, crypto_1.getJwkFromKey)(cert.publicKey);
        const alg = issuerKey.supportedSignatureAlgorithms.find((alg) => {
            return (alg === crypto_1.JwaSignatureAlgorithm.ES256 ||
                alg === crypto_1.JwaSignatureAlgorithm.ES384 ||
                alg === crypto_1.JwaSignatureAlgorithm.ES512 ||
                alg === crypto_1.JwaSignatureAlgorithm.EdDSA);
        });
        if (!alg) {
            throw new MdocError_1.MdocError(`Cannot find a suitable JwaSignatureAlgorithm for signing the mdoc. Supported algorithms are 'ES256', 'ES384', 'ES512'. The issuer key supports: ${issuerKey.supportedSignatureAlgorithms.join(', ')}`);
        }
        const issuerSignedDocument = await document.sign({
            issuerPrivateKey: issuerKey.toJson(),
            alg,
            issuerCertificate,
            kid: cert.publicKey.fingerprint,
        }, mdocContext);
        return new Mdoc(issuerSignedDocument);
    }
    async verify(agentContext, options) {
        var _a, _b;
        const x509ModuleConfig = agentContext.dependencyManager.resolve(x509_1.X509ModuleConfig);
        const certificateChain = this.issuerSignedDocument.issuerSigned.issuerAuth.certificateChain.map((certificate) => x509_1.X509Certificate.fromRawCertificate(certificate));
        let trustedCertificates = options === null || options === void 0 ? void 0 : options.trustedCertificates;
        if (!trustedCertificates) {
            trustedCertificates =
                (_b = (await ((_a = x509ModuleConfig.getTrustedCertificatesForVerification) === null || _a === void 0 ? void 0 : _a.call(x509ModuleConfig, agentContext, {
                    verification: {
                        type: 'credential',
                        credential: this,
                    },
                    certificateChain,
                })))) !== null && _b !== void 0 ? _b : x509ModuleConfig.trustedCertificates;
        }
        if (!trustedCertificates) {
            throw new MdocError_1.MdocError('No trusted certificates found. Cannot verify mdoc.');
        }
        const mdocContext = (0, MdocContext_1.getMdocContext)(agentContext);
        try {
            const verifier = new mdoc_1.Verifier();
            await verifier.verifyIssuerSignature({
                trustedCertificates: trustedCertificates.map((cert) => x509_1.X509Certificate.fromEncodedCertificate(cert).rawCertificate),
                issuerAuth: this.issuerSignedDocument.issuerSigned.issuerAuth,
                disableCertificateChainValidation: false,
                now: options === null || options === void 0 ? void 0 : options.now,
            }, mdocContext);
            await verifier.verifyData({ mdoc: this.issuerSignedDocument }, mdocContext);
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, error: error.message };
        }
    }
}
exports.Mdoc = Mdoc;
//# sourceMappingURL=Mdoc.js.map