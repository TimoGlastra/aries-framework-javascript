"use strict";
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
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
exports.CheqdRevocationStatusList = exports.CheqdRevocationRegistryDefinition = exports.CheqdRevocationRegistryDefinitionValue = exports.PublicKeys = exports.AccumKey = exports.CheqdCredentialDefinition = exports.CheqdCredentialDefinitionValue = exports.CheqdSchema = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CheqdSchema {
    constructor(options) {
        if (options) {
            this.name = options.name;
            this.attrNames = options.attrNames;
            this.version = options.version;
        }
    }
}
exports.CheqdSchema = CheqdSchema;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdSchema.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CheqdSchema.prototype, "attrNames", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdSchema.prototype, "version", void 0);
class CheqdCredentialDefinitionValue {
}
exports.CheqdCredentialDefinitionValue = CheqdCredentialDefinitionValue;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheqdCredentialDefinitionValue.prototype, "primary", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CheqdCredentialDefinitionValue.prototype, "revocation", void 0);
class CheqdCredentialDefinition {
    constructor(options) {
        if (options) {
            this.schemaId = options.schemaId;
            this.type = options.type;
            this.tag = options.tag;
            this.value = options.value;
        }
    }
}
exports.CheqdCredentialDefinition = CheqdCredentialDefinition;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdCredentialDefinition.prototype, "schemaId", void 0);
__decorate([
    (0, class_validator_1.Contains)('CL'),
    __metadata("design:type", String)
], CheqdCredentialDefinition.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdCredentialDefinition.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(CheqdCredentialDefinitionValue),
    (0, class_transformer_1.Type)(() => CheqdCredentialDefinitionValue),
    __metadata("design:type", CheqdCredentialDefinitionValue)
], CheqdCredentialDefinition.prototype, "value", void 0);
class AccumKey {
}
exports.AccumKey = AccumKey;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccumKey.prototype, "z", void 0);
class PublicKeys {
}
exports.PublicKeys = PublicKeys;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(AccumKey),
    (0, class_transformer_1.Type)(() => AccumKey),
    __metadata("design:type", AccumKey)
], PublicKeys.prototype, "accumKey", void 0);
class CheqdRevocationRegistryDefinitionValue {
}
exports.CheqdRevocationRegistryDefinitionValue = CheqdRevocationRegistryDefinitionValue;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(PublicKeys),
    (0, class_transformer_1.Type)(() => PublicKeys),
    __metadata("design:type", PublicKeys)
], CheqdRevocationRegistryDefinitionValue.prototype, "publicKeys", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CheqdRevocationRegistryDefinitionValue.prototype, "maxCredNum", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationRegistryDefinitionValue.prototype, "tailsLocation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationRegistryDefinitionValue.prototype, "tailsHash", void 0);
class CheqdRevocationRegistryDefinition {
    constructor(options) {
        if (options) {
            this.revocDefType = options.revocDefType;
            this.credDefId = options.credDefId;
            this.tag = options.tag;
            this.value = options.value;
        }
    }
}
exports.CheqdRevocationRegistryDefinition = CheqdRevocationRegistryDefinition;
__decorate([
    (0, class_validator_1.Contains)('CL_ACCUM'),
    __metadata("design:type", String)
], CheqdRevocationRegistryDefinition.prototype, "revocDefType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationRegistryDefinition.prototype, "credDefId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationRegistryDefinition.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(CheqdRevocationRegistryDefinitionValue),
    (0, class_transformer_1.Type)(() => CheqdRevocationRegistryDefinitionValue),
    __metadata("design:type", CheqdRevocationRegistryDefinitionValue)
], CheqdRevocationRegistryDefinition.prototype, "value", void 0);
class CheqdRevocationStatusList {
    constructor(options) {
        if (options) {
            this.revRegDefId = options.revRegDefId;
            this.revocationList = options.revocationList;
            this.currentAccumulator = options.currentAccumulator;
        }
    }
}
exports.CheqdRevocationStatusList = CheqdRevocationStatusList;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationStatusList.prototype, "revRegDefId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CheqdRevocationStatusList.prototype, "revocationList", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheqdRevocationStatusList.prototype, "currentAccumulator", void 0);
//# sourceMappingURL=transform.js.map