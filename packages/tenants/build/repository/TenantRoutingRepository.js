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
exports.TenantRoutingRepository = void 0;
const core_1 = require("@credo-ts/core");
const TenantRoutingRecord_1 = require("./TenantRoutingRecord");
let TenantRoutingRepository = class TenantRoutingRepository extends core_1.Repository {
    constructor(storageService, eventEmitter) {
        super(TenantRoutingRecord_1.TenantRoutingRecord, storageService, eventEmitter);
    }
    findByRecipientKey(agentContext, key) {
        return this.findSingleByQuery(agentContext, {
            recipientKeyFingerprint: key.fingerprint,
        });
    }
};
exports.TenantRoutingRepository = TenantRoutingRepository;
exports.TenantRoutingRepository = TenantRoutingRepository = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.StorageService)),
    __metadata("design:paramtypes", [Object, core_1.EventEmitter])
], TenantRoutingRepository);
//# sourceMappingURL=TenantRoutingRepository.js.map