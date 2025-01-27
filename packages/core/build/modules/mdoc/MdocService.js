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
exports.MdocService = void 0;
const tsyringe_1 = require("tsyringe");
const Mdoc_1 = require("./Mdoc");
const MdocDeviceResponse_1 = require("./MdocDeviceResponse");
const repository_1 = require("./repository");
/**
 * @internal
 */
let MdocService = class MdocService {
    constructor(mdocRepository) {
        this.MdocRepository = mdocRepository;
    }
    mdocFromBase64Url(hexEncodedMdoc) {
        return Mdoc_1.Mdoc.fromBase64Url(hexEncodedMdoc);
    }
    signMdoc(agentContext, options) {
        return Mdoc_1.Mdoc.sign(agentContext, options);
    }
    async verifyMdoc(agentContext, mdoc, options) {
        return await mdoc.verify(agentContext, options);
    }
    async createDeviceResponse(agentContext, options) {
        return MdocDeviceResponse_1.MdocDeviceResponse.createDeviceResponse(agentContext, options);
    }
    async createOpenId4VpDeviceResponse(agentContext, options) {
        return MdocDeviceResponse_1.MdocDeviceResponse.createOpenId4VpPexDeviceResponse(agentContext, options);
    }
    async verifyDeviceResponse(agentContext, options) {
        const deviceResponse = MdocDeviceResponse_1.MdocDeviceResponse.fromBase64Url(options.deviceResponse);
        return deviceResponse.verify(agentContext, options);
    }
    async store(agentContext, mdoc) {
        const mdocRecord = new repository_1.MdocRecord({ mdoc });
        await this.MdocRepository.save(agentContext, mdocRecord);
        return mdocRecord;
    }
    async getById(agentContext, id) {
        return await this.MdocRepository.getById(agentContext, id);
    }
    async getAll(agentContext) {
        return await this.MdocRepository.getAll(agentContext);
    }
    async findByQuery(agentContext, query, queryOptions) {
        return await this.MdocRepository.findByQuery(agentContext, query, queryOptions);
    }
    async deleteById(agentContext, id) {
        await this.MdocRepository.deleteById(agentContext, id);
    }
    async update(agentContext, mdocRecord) {
        await this.MdocRepository.update(agentContext, mdocRecord);
    }
};
exports.MdocService = MdocService;
exports.MdocService = MdocService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [repository_1.MdocRepository])
], MdocService);
//# sourceMappingURL=MdocService.js.map