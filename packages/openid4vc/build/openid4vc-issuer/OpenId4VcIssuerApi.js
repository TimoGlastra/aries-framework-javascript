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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerApi = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcIssuerModuleConfig_1 = require("./OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("./OpenId4VcIssuerService");
/**
 * @public
 * This class represents the API for interacting with the OpenID4VC Issuer service.
 * It provides methods for creating a credential offer, creating a response to a credential issuance request,
 * and retrieving a credential offer from a URI.
 */
let OpenId4VcIssuerApi = class OpenId4VcIssuerApi {
    constructor(config, agentContext, openId4VcIssuerService) {
        this.config = config;
        this.agentContext = agentContext;
        this.openId4VcIssuerService = openId4VcIssuerService;
    }
    async getAllIssuers() {
        return this.openId4VcIssuerService.getAllIssuers(this.agentContext);
    }
    async getIssuerByIssuerId(issuerId) {
        return this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
    }
    /**
     * Creates an issuer and stores the corresponding issuer metadata. Multiple issuers can be created, to allow different sets of
     * credentials to be issued with each issuer.
     */
    async createIssuer(options) {
        return this.openId4VcIssuerService.createIssuer(this.agentContext, options);
    }
    /**
     * Rotate the key used for signing access tokens for the issuer with the given issuerId.
     */
    async rotateAccessTokenSigningKey(issuerId) {
        const issuer = await this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
        return this.openId4VcIssuerService.rotateAccessTokenSigningKey(this.agentContext, issuer);
    }
    async updateIssuerMetadata(options) {
        const { issuerId, credentialConfigurationsSupported, display, dpopSigningAlgValuesSupported, batchCredentialIssuance, } = options;
        const issuer = await this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
        issuer.credentialConfigurationsSupported = credentialConfigurationsSupported;
        issuer.display = display;
        issuer.dpopSigningAlgValuesSupported = dpopSigningAlgValuesSupported;
        issuer.batchCredentialIssuance = batchCredentialIssuance;
        return this.openId4VcIssuerService.updateIssuer(this.agentContext, issuer);
    }
    /**
     * Creates a stateless credential offer. This can only be used with an external authorization server, as credo only supports statefull
     * crednetial offers.
     */
    async createStatelessCredentialOffer(options) {
        const { issuerId } = options, rest = __rest(options, ["issuerId"]);
        const issuer = await this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
        return await this.openId4VcIssuerService.createStatelessCredentialOffer(this.agentContext, Object.assign(Object.assign({}, rest), { issuer }));
    }
    /**
     * Creates a credential offer. Either the preAuthorizedCodeFlowConfig or the authorizationCodeFlowConfig must be provided.
     *
     * @returns Object containing the payload of the credential offer and the credential offer request, which can be sent to the wallet.
     */
    async createCredentialOffer(options) {
        const { issuerId } = options, rest = __rest(options, ["issuerId"]);
        const issuer = await this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
        return await this.openId4VcIssuerService.createCredentialOffer(this.agentContext, Object.assign(Object.assign({}, rest), { issuer }));
    }
    /**
     * This function creates a response which can be send to the holder after receiving a credential issuance request.
     */
    async createCredentialResponse(options) {
        const { issuanceSessionId } = options, rest = __rest(options, ["issuanceSessionId"]);
        const issuanceSession = await this.openId4VcIssuerService.getIssuanceSessionById(this.agentContext, issuanceSessionId);
        return await this.openId4VcIssuerService.createCredentialResponse(this.agentContext, Object.assign(Object.assign({}, rest), { issuanceSession }));
    }
    async getIssuerMetadata(issuerId) {
        const issuer = await this.openId4VcIssuerService.getIssuerByIssuerId(this.agentContext, issuerId);
        return this.openId4VcIssuerService.getIssuerMetadata(this.agentContext, issuer);
    }
    async getIssuanceSessionById(issuanceSessionId) {
        return this.openId4VcIssuerService.getIssuanceSessionById(this.agentContext, issuanceSessionId);
    }
};
exports.OpenId4VcIssuerApi = OpenId4VcIssuerApi;
exports.OpenId4VcIssuerApi = OpenId4VcIssuerApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig,
        core_1.AgentContext,
        OpenId4VcIssuerService_1.OpenId4VcIssuerService])
], OpenId4VcIssuerApi);
//# sourceMappingURL=OpenId4VcIssuerApi.js.map