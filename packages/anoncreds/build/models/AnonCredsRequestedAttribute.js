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
exports.AnonCredsRequestedAttribute = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AnonCredsRestriction_1 = require("./AnonCredsRestriction");
const AnonCredsRevocationInterval_1 = require("./AnonCredsRevocationInterval");
class AnonCredsRequestedAttribute {
    constructor(options) {
        var _a;
        if (options) {
            this.name = options.name;
            this.names = options.names;
            this.nonRevoked = options.nonRevoked ? new AnonCredsRevocationInterval_1.AnonCredsRevocationInterval(options.nonRevoked) : undefined;
            this.restrictions = (_a = options.restrictions) === null || _a === void 0 ? void 0 : _a.map((r) => new AnonCredsRestriction_1.AnonCredsRestriction(r));
        }
    }
}
exports.AnonCredsRequestedAttribute = AnonCredsRequestedAttribute;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.names === undefined),
    __metadata("design:type", String)
], AnonCredsRequestedAttribute.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ValidateIf)((o) => o.name === undefined),
    (0, class_validator_1.ArrayNotEmpty)(),
    __metadata("design:type", Array)
], AnonCredsRequestedAttribute.prototype, "names", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'non_revoked' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    (0, class_transformer_1.Type)(() => AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AnonCredsRevocationInterval_1.AnonCredsRevocationInterval)
], AnonCredsRequestedAttribute.prototype, "nonRevoked", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AnonCredsRestriction_1.AnonCredsRestriction),
    (0, class_validator_1.IsOptional)(),
    (0, AnonCredsRestriction_1.AnonCredsRestrictionTransformer)(),
    __metadata("design:type", Array)
], AnonCredsRequestedAttribute.prototype, "restrictions", void 0);
//# sourceMappingURL=AnonCredsRequestedAttribute.js.map