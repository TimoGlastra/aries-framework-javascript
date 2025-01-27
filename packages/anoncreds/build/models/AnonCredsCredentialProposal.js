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
exports.AnonCredsCredentialProposal = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/**
 * Class representing an AnonCreds credential proposal as defined in Aries RFC 0592 (and soon the new AnonCreds RFC)
 */
class AnonCredsCredentialProposal {
    constructor(options) {
        if (options) {
            this.schemaIssuerDid = options.schemaIssuerDid;
            this.schemaIssuerId = options.schemaIssuerId;
            this.schemaId = options.schemaId;
            this.schemaName = options.schemaName;
            this.schemaVersion = options.schemaVersion;
            this.credentialDefinitionId = options.credentialDefinitionId;
            this.issuerDid = options.issuerDid;
            this.issuerId = options.issuerId;
        }
    }
}
exports.AnonCredsCredentialProposal = AnonCredsCredentialProposal;
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_issuer_did' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "schemaIssuerDid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_issuer_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "schemaIssuerId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "schemaId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "schemaName", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_version' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "schemaVersion", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'cred_def_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "credentialDefinitionId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'issuer_did' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "issuerDid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'issuer_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnonCredsCredentialProposal.prototype, "issuerId", void 0);
//# sourceMappingURL=AnonCredsCredentialProposal.js.map