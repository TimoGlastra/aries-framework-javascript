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
exports.AnonCredsRestriction = void 0;
exports.AnonCredsRestrictionTransformer = AnonCredsRestrictionTransformer;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AnonCredsRestriction {
    constructor(options) {
        var _a, _b;
        this.attributeMarkers = {};
        this.attributeValues = {};
        if (options) {
            this.schemaId = options.schemaId;
            this.schemaIssuerDid = options.schemaIssuerDid;
            this.schemaIssuerId = options.schemaIssuerId;
            this.schemaName = options.schemaName;
            this.schemaVersion = options.schemaVersion;
            this.issuerDid = options.issuerDid;
            this.issuerId = options.issuerId;
            this.credentialDefinitionId = options.credentialDefinitionId;
            this.attributeMarkers = (_a = options.attributeMarkers) !== null && _a !== void 0 ? _a : {};
            this.attributeValues = (_b = options.attributeValues) !== null && _b !== void 0 ? _b : {};
        }
    }
}
exports.AnonCredsRestriction = AnonCredsRestriction;
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "schemaId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_issuer_did' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "schemaIssuerDid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_issuer_id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "schemaIssuerId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "schemaName", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_version' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "schemaVersion", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'issuer_did' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "issuerDid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'issuer_id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "issuerId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'cred_def_id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnonCredsRestriction.prototype, "credentialDefinitionId", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], AnonCredsRestriction.prototype, "attributeMarkers", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], AnonCredsRestriction.prototype, "attributeValues", void 0);
/**
 * Decorator that transforms attribute values and attribute markers.
 *
 * It will transform between the following JSON structure:
 * ```json
 * {
 *  "attr::test_prop::value": "test_value"
 *  "attr::test_prop::marker": "1
 * }
 * ```
 *
 * And the following AnonCredsRestriction:
 * ```json
 * {
 *  "attributeValues": {
 *    "test_prop": "test_value"
 *  },
 *  "attributeMarkers": {
 *   "test_prop": true
 *  }
 * }
 * ```
 *
 * @example
 * class Example {
 *   AttributeFilterTransformer()
 *   public restrictions!: AnonCredsRestriction[]
 * }
 */
function AnonCredsRestrictionTransformer() {
    return (0, class_transformer_1.Transform)(({ value: restrictions, type }) => {
        switch (type) {
            case class_transformer_1.TransformationType.CLASS_TO_PLAIN:
                if (restrictions && Array.isArray(restrictions)) {
                    for (const restriction of restrictions) {
                        const r = restriction;
                        for (const [attributeName, attributeValue] of Object.entries(r.attributeValues)) {
                            restriction[`attr::${attributeName}::value`] = attributeValue;
                        }
                        for (const [attributeName] of Object.entries(r.attributeMarkers)) {
                            restriction[`attr::${attributeName}::marker`] = '1';
                        }
                    }
                }
                return restrictions;
            case class_transformer_1.TransformationType.PLAIN_TO_CLASS:
                if (restrictions && Array.isArray(restrictions)) {
                    for (const restriction of restrictions) {
                        const r = restriction;
                        for (const [attributeName, attributeValue] of Object.entries(r)) {
                            const match = new RegExp('^attr::([^:]+)::(value|marker)$').exec(attributeName);
                            if (match && match[2] === 'marker' && attributeValue === '1') {
                                r.attributeMarkers[match[1]] = true;
                                delete restriction[attributeName];
                            }
                            else if (match && match[2] === 'value') {
                                r.attributeValues[match[1]] = attributeValue;
                                delete restriction[attributeName];
                            }
                        }
                    }
                }
                return restrictions;
            default:
                return restrictions;
        }
    });
}
//# sourceMappingURL=AnonCredsRestriction.js.map