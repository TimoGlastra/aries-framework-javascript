"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509ModuleConfig = void 0;
class X509ModuleConfig {
    constructor(options) {
        this.options = (options === null || options === void 0 ? void 0 : options.trustedCertificates) ? { trustedCertificates: [...options.trustedCertificates] } : {};
    }
    get trustedCertificates() {
        return this.options.trustedCertificates;
    }
    setTrustedCertificates(trustedCertificates) {
        this.options.trustedCertificates = trustedCertificates ? [...trustedCertificates] : undefined;
    }
    addTrustedCertificate(trustedCertificate) {
        if (!this.options.trustedCertificates) {
            this.options.trustedCertificates = [trustedCertificate];
            return;
        }
        this.options.trustedCertificates.push(trustedCertificate);
    }
}
exports.X509ModuleConfig = X509ModuleConfig;
//# sourceMappingURL=X509ModuleConfig.js.map