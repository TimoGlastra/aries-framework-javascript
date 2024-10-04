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
exports.NewDidCommV2Service = exports.NewDidCommV2ServiceEndpoint = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const error_1 = require("../../../../error");
const utils_1 = require("../../../../utils");
const DidDocumentService_1 = require("./DidDocumentService");
class NewDidCommV2ServiceEndpoint {
    constructor(options) {
        if (options) {
            this.uri = options.uri;
            this.routingKeys = options.routingKeys;
            this.accept = options.accept;
        }
    }
}
exports.NewDidCommV2ServiceEndpoint = NewDidCommV2ServiceEndpoint;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, utils_1.IsUri)(),
    __metadata("design:type", String)
], NewDidCommV2ServiceEndpoint.prototype, "uri", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], NewDidCommV2ServiceEndpoint.prototype, "routingKeys", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], NewDidCommV2ServiceEndpoint.prototype, "accept", void 0);
/**
 * Will be renamed to `DidCommV2Service` in 0.6 (and replace the current `DidCommV2Service`)
 */
class NewDidCommV2Service extends DidDocumentService_1.DidDocumentService {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { type: NewDidCommV2Service.type }));
        if (options) {
            this.serviceEndpoint = options.serviceEndpoint;
        }
    }
    get firstServiceEndpointUri() {
        if (Array.isArray(this.serviceEndpoint)) {
            if (this.serviceEndpoint.length === 0) {
                throw new error_1.CredoError('No entries in serviceEndpoint array');
            }
            return this.serviceEndpoint[0].uri;
        }
        return this.serviceEndpoint.uri;
    }
}
exports.NewDidCommV2Service = NewDidCommV2Service;
NewDidCommV2Service.type = 'DIDCommMessaging';
__decorate([
    (0, utils_1.IsInstanceOrArrayOfInstances)({ classType: [NewDidCommV2ServiceEndpoint] }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NewDidCommV2ServiceEndpoint),
    __metadata("design:type", Object)
], NewDidCommV2Service.prototype, "serviceEndpoint", void 0);
//# sourceMappingURL=NewDidCommV2Service.js.map