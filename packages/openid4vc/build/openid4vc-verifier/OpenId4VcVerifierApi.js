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
exports.OpenId4VcVerifierApi = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcSiopVerifierService_1 = require("./OpenId4VcSiopVerifierService");
const OpenId4VcVerifierModuleConfig_1 = require("./OpenId4VcVerifierModuleConfig");
/**
 * @public
 */
let OpenId4VcVerifierApi = class OpenId4VcVerifierApi {
    constructor(config, agentContext, openId4VcSiopVerifierService) {
        this.config = config;
        this.agentContext = agentContext;
        this.openId4VcSiopVerifierService = openId4VcSiopVerifierService;
    }
    /**
     * Retrieve all verifier records from storage
     */
    async getAllVerifiers() {
        return this.openId4VcSiopVerifierService.getAllVerifiers(this.agentContext);
    }
    /**
     * Retrieve a verifier record from storage by its verified id
     */
    async getVerifierByVerifierId(verifierId) {
        return this.openId4VcSiopVerifierService.getVerifierByVerifierId(this.agentContext, verifierId);
    }
    /**
     * Create a new verifier and store the new verifier record.
     */
    async createVerifier(options) {
        return this.openId4VcSiopVerifierService.createVerifier(this.agentContext, options);
    }
    async updateVerifierMetadata(options) {
        const { verifierId, clientMetadata } = options;
        const verifier = await this.openId4VcSiopVerifierService.getVerifierByVerifierId(this.agentContext, verifierId);
        verifier.clientMetadata = clientMetadata;
        return this.openId4VcSiopVerifierService.updateVerifier(this.agentContext, verifier);
    }
    async findVerificationSessionsByQuery(query, queryOptions) {
        return this.openId4VcSiopVerifierService.findVerificationSessionsByQuery(this.agentContext, query, queryOptions);
    }
    async getVerificationSessionById(verificationSessionId) {
        return this.openId4VcSiopVerifierService.getVerificationSessionById(this.agentContext, verificationSessionId);
    }
    /**
     * Create an authorization request, acting as a Relying Party (RP).
     *
     * Currently two types of requests are supported:
     *  - SIOP Self-Issued ID Token request: request to a Self-Issued OP from an RP
     *  - SIOP Verifiable Presentation Request: request to a Self-Issued OP from an RP, requesting a Verifiable Presentation using OpenID4VP
     *
     * Other flows (non-SIOP) are not supported at the moment, but can be added in the future.
     *
     * See {@link OpenId4VcSiopCreateAuthorizationRequestOptions} for detailed documentation on the options.
     */
    async createAuthorizationRequest(_a) {
        var { verifierId } = _a, otherOptions = __rest(_a, ["verifierId"]);
        const verifier = await this.getVerifierByVerifierId(verifierId);
        return await this.openId4VcSiopVerifierService.createAuthorizationRequest(this.agentContext, Object.assign(Object.assign({}, otherOptions), { verifier }));
    }
    /**
     * Verifies an authorization response, acting as a Relying Party (RP).
     *
     * It validates the ID Token, VP Token and the signature(s) of the received Verifiable Presentation(s)
     * as well as that the structure of the Verifiable Presentation matches the provided presentation definition.
     */
    async verifyAuthorizationResponse(_a) {
        var { verificationSessionId } = _a, otherOptions = __rest(_a, ["verificationSessionId"]);
        const verificationSession = await this.getVerificationSessionById(verificationSessionId);
        return await this.openId4VcSiopVerifierService.verifyAuthorizationResponse(this.agentContext, Object.assign(Object.assign({}, otherOptions), { verificationSession }));
    }
    async getVerifiedAuthorizationResponse(verificationSessionId) {
        const verificationSession = await this.getVerificationSessionById(verificationSessionId);
        return this.openId4VcSiopVerifierService.getVerifiedAuthorizationResponse(verificationSession);
    }
    async findVerificationSessionForAuthorizationResponse(options) {
        return this.openId4VcSiopVerifierService.findVerificationSessionForAuthorizationResponse(this.agentContext, options);
    }
};
exports.OpenId4VcVerifierApi = OpenId4VcVerifierApi;
exports.OpenId4VcVerifierApi = OpenId4VcVerifierApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig,
        core_1.AgentContext,
        OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService])
], OpenId4VcVerifierApi);
//# sourceMappingURL=OpenId4VcVerifierApi.js.map