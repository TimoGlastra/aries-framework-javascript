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
exports.AnonCredsProofRequest = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../utils");
const AnonCredsRequestedAttribute_1 = require("./AnonCredsRequestedAttribute");
const AnonCredsRequestedPredicate_1 = require("./AnonCredsRequestedPredicate");
const AnonCredsRevocationInterval_1 = require("./AnonCredsRevocationInterval");
/**
 * Proof Request for AnonCreds based proof format
 */
class AnonCredsProofRequest {
    constructor(options) {
        var _a, _b;
        if (options) {
            this.name = options.name;
            this.version = options.version;
            this.nonce = options.nonce;
            this.requestedAttributes = new Map(Object.entries((_a = options.requestedAttributes) !== null && _a !== void 0 ? _a : {}).map(([key, attribute]) => [
                key,
                new AnonCredsRequestedAttribute_1.AnonCredsRequestedAttribute(attribute),
            ]));
            this.requestedPredicates = new Map(Object.entries((_b = options.requestedPredicates) !== null && _b !== void 0 ? _b : {}).map(([key, predicate]) => [
                key,
                new AnonCredsRequestedPredicate_1.AnonCredsRequestedPredicate(predicate),
            ]));
            this.nonRevoked = options.nonRevoked ? new AnonCredsRevocationInterval_1.AnonCredsRevocationInterval(options.nonRevoked) : undefined;
            this.ver = options.ver;
        }
    }
}
exports.AnonCredsProofRequest = AnonCredsProofRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsProofRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsProofRequest.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsProofRequest.prototype, "nonce", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'requested_attributes' }),
    (0, utils_1.IsMap)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AnonCredsRequestedAttribute_1.AnonCredsRequestedAttribute),
    __metadata("design:type", Map)
], AnonCredsProofRequest.prototype, "requestedAttributes", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'requested_predicates' }),
    (0, utils_1.IsMap)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AnonCredsRequestedPredicate_1.AnonCredsRequestedPredicate),
    __metadata("design:type", Map)
], AnonCredsProofRequest.prototype, "requestedPredicates", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'non_revoked' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInstance)(AnonCredsRevocationInterval_1.AnonCredsRevocationInterval),
    __metadata("design:type", AnonCredsRevocationInterval_1.AnonCredsRevocationInterval)
], AnonCredsProofRequest.prototype, "nonRevoked", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['1.0', '2.0']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsProofRequest.prototype, "ver", void 0);
//# sourceMappingURL=AnonCredsProofRequest.js.map