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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerRepository = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcIssuerRecord_1 = require("./OpenId4VcIssuerRecord");
let OpenId4VcIssuerRepository = class OpenId4VcIssuerRepository extends core_1.Repository {
    constructor(storageService, eventEmitter) {
        super(OpenId4VcIssuerRecord_1.OpenId4VcIssuerRecord, storageService, eventEmitter);
    }
    findByIssuerId(agentContext, issuerId) {
        return this.findSingleByQuery(agentContext, { issuerId });
    }
    getByIssuerId(agentContext, issuerId) {
        return this.getSingleByQuery(agentContext, { issuerId });
    }
};
exports.OpenId4VcIssuerRepository = OpenId4VcIssuerRepository;
exports.OpenId4VcIssuerRepository = OpenId4VcIssuerRepository = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.StorageService)),
    __metadata("design:paramtypes", [Object, core_1.EventEmitter])
], OpenId4VcIssuerRepository);
//# sourceMappingURL=OpenId4VcIssuerRepository.js.map