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
exports.MdocApi = void 0;
const agent_1 = require("../../agent");
const plugins_1 = require("../../plugins");
const Mdoc_1 = require("./Mdoc");
const MdocService_1 = require("./MdocService");
/**
 * @public
 */
let MdocApi = class MdocApi {
    constructor(agentContext, mdocService) {
        this.agentContext = agentContext;
        this.mdocService = mdocService;
    }
    /**
     * Create a new Mdoc, with a spcific doctype, namespace, and validity info.
     *
     * @param options {MdocSignOptions}
     * @returns {Promise<Mdoc>}
     */
    async sign(options) {
        return await this.mdocService.signMdoc(this.agentContext, options);
    }
    /**
     *
     * Verify an incoming mdoc. It will check whether everything is valid, but also returns parts of the validation.
     *
     * For example, you might still want to continue with a flow if not all the claims are included, but the signature is valid.
     *
     */
    async verify(mdoc, options) {
        return await this.mdocService.verifyMdoc(this.agentContext, mdoc, options);
    }
    /**
     * Create a Mdoc class from a base64url encoded Mdoc Issuer-Signed structure
     */
    fromBase64Url(base64Url) {
        return Mdoc_1.Mdoc.fromBase64Url(base64Url);
    }
    async store(issuerSigned) {
        return await this.mdocService.store(this.agentContext, issuerSigned);
    }
    async getById(id) {
        return await this.mdocService.getById(this.agentContext, id);
    }
    async getAll() {
        return await this.mdocService.getAll(this.agentContext);
    }
    async findAllByQuery(query, queryOptions) {
        return await this.mdocService.findByQuery(this.agentContext, query, queryOptions);
    }
    async deleteById(id) {
        return await this.mdocService.deleteById(this.agentContext, id);
    }
    async update(mdocRecord) {
        return await this.mdocService.update(this.agentContext, mdocRecord);
    }
};
exports.MdocApi = MdocApi;
exports.MdocApi = MdocApi = __decorate([
    (0, plugins_1.injectable)(),
    __metadata("design:paramtypes", [agent_1.AgentContext, MdocService_1.MdocService])
], MdocApi);
//# sourceMappingURL=MdocApi.js.map