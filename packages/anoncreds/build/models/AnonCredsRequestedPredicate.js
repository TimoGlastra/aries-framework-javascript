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
exports.AnonCredsRequestedPredicate = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../models");
const AnonCredsRestriction_1 = require("./AnonCredsRestriction");
const AnonCredsRevocationInterval_1 = require("./AnonCredsRevocationInterval");
class AnonCredsRequestedPredicate {
    constructor(options) {
        var _a;
        if (options) {
            this.name = options.name;
            this.nonRevoked = options.nonRevoked ? new AnonCredsRevocationInterval_1.AnonCredsRevocationInterval(options.nonRevoked) : undefined;
            this.restrictions = (_a = options.restrictions) === null || _a === void 0 ? void 0 : _a.map((r) => new AnonCredsRestriction_1.AnonCredsRestriction(r));
            this.predicateType = options.predicateType;
            this.predicateValue = options.predicateValue;
        }
    }
}
exports.AnonCredsRequestedPredicate = AnonCredsRequestedPredicate;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRequestedPredicate.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'p_type' }),
    (0, class_validator_1.IsIn)(models_1.anonCredsPredicateType),
    __metadata("design:type", String)
], AnonCredsRequestedPredicate.prototype, "predicateType", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'p_value' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AnonCredsRequestedPredicate.prototype, "predicateValue", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'non_revoked' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInstance)(AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    __metadata("design:type", AnonCredsRevocationInterval_1.AnonCredsRevocationInterval)
], AnonCredsRequestedPredicate.prototype, "nonRevoked", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AnonCredsRestriction_1.AnonCredsRestriction),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, AnonCredsRestriction_1.AnonCredsRestrictionTransformer)(),
    __metadata("design:type", Array)
], AnonCredsRequestedPredicate.prototype, "restrictions", void 0);
//# sourceMappingURL=AnonCredsRequestedPredicate.js.map