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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Service = void 0;
const x509 = __importStar(require("@peculiar/x509"));
const tsyringe_1 = require("tsyringe");
const webcrypto_1 = require("../../crypto/webcrypto");
const X509Certificate_1 = require("./X509Certificate");
const X509Error_1 = require("./X509Error");
let X509Service = class X509Service {
    /**
     *
     * Validate a chain of X.509 certificates according to RFC 5280
     *
     * This function requires a list of base64 encoded certificates and, optionally, a certificate that should be found in the chain.
     * If no certificate is provided, it will just assume the leaf certificate
     *
     * The leaf certificate should be the 0th index and the root the last
     *
     * Additional validation:
     *   - Make sure atleast a single certificate is in the chain
     *   - Check whether a certificate in the chain matches with a trusted certificate
     */
    static async validateCertificateChain(agentContext, { certificateChain, certificate = certificateChain[0], verificationDate = new Date(), trustedCertificates, }) {
        const webCrypto = new webcrypto_1.CredoWebCrypto(agentContext);
        if (certificateChain.length === 0)
            throw new X509Error_1.X509Error('Certificate chain is empty');
        const parsedLeafCertificate = new x509.X509Certificate(certificate);
        const parsedCertificates = certificateChain.map((c) => new x509.X509Certificate(c));
        const certificateChainBuilder = new x509.X509ChainBuilder({ certificates: parsedCertificates });
        const chain = await certificateChainBuilder.build(parsedLeafCertificate, webCrypto);
        // The chain is reversed here as the `x5c` header (the expected input),
        // has the leaf certificate as the first entry, while the `x509` library expects this as the last
        let parsedChain = chain.map((c) => X509Certificate_1.X509Certificate.fromRawCertificate(new Uint8Array(c.rawData))).reverse();
        if (parsedChain.length !== certificateChain.length) {
            throw new X509Error_1.X509Error('Could not parse the full chain. Likely due to incorrect ordering');
        }
        if (trustedCertificates) {
            const parsedTrustedCertificates = trustedCertificates.map((trustedCertificate) => X509Certificate_1.X509Certificate.fromEncodedCertificate(trustedCertificate));
            const trustedCertificateIndex = parsedChain.findIndex((cert) => parsedTrustedCertificates.some((tCert) => cert.equal(tCert)));
            if (trustedCertificateIndex === -1) {
                throw new X509Error_1.X509Error('No trusted certificate was found while validating the X.509 chain');
            }
            // Pop everything off above the index of the trusted as it is not relevant for validation
            parsedChain = parsedChain.slice(0, trustedCertificateIndex);
        }
        // Verify the certificate with the publicKey of the certificate above
        for (let i = 0; i < parsedChain.length; i++) {
            const cert = parsedChain[i];
            const previousCertificate = parsedChain[i - 1];
            const publicKey = previousCertificate ? previousCertificate.publicKey : undefined;
            await cert.verify({ publicKey, verificationDate }, webCrypto);
        }
        return parsedChain;
    }
    /**
     *
     * Parses a base64-encoded X.509 certificate into a {@link X509Certificate}
     *
     */
    static parseCertificate(_agentContext, { encodedCertificate }) {
        const certificate = X509Certificate_1.X509Certificate.fromEncodedCertificate(encodedCertificate);
        return certificate;
    }
    static getLeafCertificate(_agentContext, { certificateChain }) {
        if (certificateChain.length === 0)
            throw new X509Error_1.X509Error('Certificate chain is empty');
        const certificate = X509Certificate_1.X509Certificate.fromEncodedCertificate(certificateChain[0]);
        return certificate;
    }
    static async createSelfSignedCertificate(agentContext, options) {
        const webCrypto = new webcrypto_1.CredoWebCrypto(agentContext);
        const certificate = await X509Certificate_1.X509Certificate.createSelfSigned(options, webCrypto);
        return certificate;
    }
};
exports.X509Service = X509Service;
exports.X509Service = X509Service = __decorate([
    (0, tsyringe_1.injectable)()
], X509Service);
//# sourceMappingURL=X509Service.js.map