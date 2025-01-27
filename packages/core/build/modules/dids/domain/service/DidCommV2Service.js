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
exports.DidCommV2Service = void 0;
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../../utils");
const DidDocumentService_1 = require("./DidDocumentService");
const NewDidCommV2Service_1 = require("./NewDidCommV2Service");
/**
 * @deprecated use `NewDidCommV2Service` instead. Will be renamed to `LegacyDidCommV2Service` in 0.6
 */
class DidCommV2Service extends DidDocumentService_1.DidDocumentService {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { type: DidCommV2Service.type }));
        if (options) {
            this.serviceEndpoint = options.serviceEndpoint;
            this.accept = options.accept;
            this.routingKeys = options.routingKeys;
        }
    }
    toNewDidCommV2() {
        return new NewDidCommV2Service_1.NewDidCommV2Service({
            id: this.id,
            serviceEndpoint: new NewDidCommV2Service_1.NewDidCommV2ServiceEndpoint({
                uri: this.serviceEndpoint,
                accept: this.accept,
                routingKeys: this.routingKeys,
            }),
        });
    }
}
exports.DidCommV2Service = DidCommV2Service;
DidCommV2Service.type = 'DIDComm';
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DidCommV2Service.prototype, "routingKeys", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], DidCommV2Service.prototype, "accept", void 0);
__decorate([
    (0, utils_1.IsUri)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DidCommV2Service.prototype, "serviceEndpoint", void 0);
//# sourceMappingURL=DidCommV2Service.js.map