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
exports.V1PresentationPreview = exports.V1PresentationPreviewPredicate = exports.V1PresentationPreviewAttribute = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const models_1 = require("../../../../models");
const utils_1 = require("../../../../utils");
class V1PresentationPreviewAttribute {
    constructor(options) {
        if (options) {
            this.name = options.name;
            this.credentialDefinitionId = options.credentialDefinitionId;
            this.mimeType = options.mimeType;
            this.value = options.value;
            this.referent = options.referent;
        }
    }
    toJSON() {
        return core_1.JsonTransformer.toJSON(this);
    }
}
exports.V1PresentationPreviewAttribute = V1PresentationPreviewAttribute;
__decorate([
    (0, class_transformer_1.Expose)({ name: 'cred_def_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.referent !== undefined),
    (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex),
    __metadata("design:type", String)
], V1PresentationPreviewAttribute.prototype, "credentialDefinitionId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'mime-type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMimeType)(),
    __metadata("design:type", String)
], V1PresentationPreviewAttribute.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1PresentationPreviewAttribute.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1PresentationPreviewAttribute.prototype, "referent", void 0);
class V1PresentationPreviewPredicate {
    constructor(options) {
        if (options) {
            this.name = options.name;
            this.credentialDefinitionId = options.credentialDefinitionId;
            this.predicate = options.predicate;
            this.threshold = options.threshold;
        }
    }
    toJSON() {
        return core_1.JsonTransformer.toJSON(this);
    }
}
exports.V1PresentationPreviewPredicate = V1PresentationPreviewPredicate;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], V1PresentationPreviewPredicate.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'cred_def_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex),
    __metadata("design:type", String)
], V1PresentationPreviewPredicate.prototype, "credentialDefinitionId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(models_1.anonCredsPredicateType),
    __metadata("design:type", String)
], V1PresentationPreviewPredicate.prototype, "predicate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], V1PresentationPreviewPredicate.prototype, "threshold", void 0);
/**
 * Presentation preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used to construct a preview of the data for the presentation.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation-preview
 */
class V1PresentationPreview {
    constructor(options) {
        var _a, _b, _c, _d;
        this.type = V1PresentationPreview.type.messageTypeUri;
        if (options) {
            this.attributes = (_b = (_a = options.attributes) === null || _a === void 0 ? void 0 : _a.map((a) => new V1PresentationPreviewAttribute(a))) !== null && _b !== void 0 ? _b : [];
            this.predicates = (_d = (_c = options.predicates) === null || _c === void 0 ? void 0 : _c.map((p) => new V1PresentationPreviewPredicate(p))) !== null && _d !== void 0 ? _d : [];
        }
    }
    toJSON() {
        return core_1.JsonTransformer.toJSON(this);
    }
}
exports.V1PresentationPreview = V1PresentationPreview;
V1PresentationPreview.type = (0, core_1.parseMessageType)('https://didcomm.org/present-proof/1.0/presentation-preview');
__decorate([
    (0, class_transformer_1.Expose)({ name: '@type' }),
    (0, core_1.IsValidMessageType)(V1PresentationPreview.type),
    (0, class_transformer_1.Transform)(({ value }) => (0, core_1.replaceLegacyDidSovPrefix)(value), {
        toClassOnly: true,
    }),
    __metadata("design:type", Object)
], V1PresentationPreview.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => V1PresentationPreviewAttribute),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsInstance)(V1PresentationPreviewAttribute, { each: true }),
    __metadata("design:type", Array)
], V1PresentationPreview.prototype, "attributes", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => V1PresentationPreviewPredicate),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsInstance)(V1PresentationPreviewPredicate, { each: true }),
    __metadata("design:type", Array)
], V1PresentationPreview.prototype, "predicates", void 0);
//# sourceMappingURL=V1PresentationPreview.js.map