"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Api = void 0;
const agent_1 = require("../../agent");
const plugins_1 = require("../../plugins");
const X509ModuleConfig_1 = require("./X509ModuleConfig");
const X509Service_1 = require("./X509Service");
/**
 * @public
 */
let X509Api = class X509Api {
    constructor(agentContext, x509ModuleConfig, x509Service) {
        this.agentContext = agentContext;
        this.x509ModuleConfig = x509ModuleConfig;
        this.x509Service = x509Service;
    }
    /**
     * Adds a trusted certificate to the X509 Module Config.
     *
     * @param certificate
     */
    async addTrustedCertificate(certificate) {
        this.x509ModuleConfig.addTrustedCertificate(certificate);
    }
    /**
     * Overwrites the trusted certificates in the X509 Module Config.
     *
     * @param certificate
     */
    async setTrustedCertificates(certificates) {
        this.x509ModuleConfig.setTrustedCertificates(certificates);
    }
    /**
     * Creates a self-signed certificate.
     *
     * @param options X509CreateSelfSignedCertificateOptions
     */
    async createSelfSignedCertificate(options) {
        return await X509Service_1.X509Service.createSelfSignedCertificate(this.agentContext, options);
    }
    /**
     * Validate a certificate chain.
     *
     * @param options X509ValidateCertificateChainOptions
     */
    async validateCertificateChain(options) {
        return await X509Service_1.X509Service.validateCertificateChain(this.agentContext, options);
    }
};
exports.X509Api = X509Api;
exports.X509Api = X509Api = __decorate([
    (0, plugins_1.injectable)(),
    __metadata("design:paramtypes", [agent_1.AgentContext,
        X509ModuleConfig_1.X509ModuleConfig,
        X509Service_1.X509Service])
], X509Api);
//# sourceMappingURL=X509Api.js.map