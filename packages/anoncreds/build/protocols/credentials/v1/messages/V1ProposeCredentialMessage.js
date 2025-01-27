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
exports.V1ProposeCredentialMessage = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const utils_1 = require("../../../../utils");
const V1CredentialPreview_1 = require("./V1CredentialPreview");
/**
 * Message part of Issue Credential Protocol used to initiate credential exchange by prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#propose-credential
 */
class V1ProposeCredentialMessage extends core_1.AgentMessage {
    constructor(options) {
        var _a;
        super();
        this.allowDidSovPrefix = true;
        this.type = V1ProposeCredentialMessage.type.messageTypeUri;
        if (options) {
            this.id = (_a = options.id) !== null && _a !== void 0 ? _a : this.generateId();
            this.comment = options.comment;
            this.credentialPreview = options.credentialPreview;
            this.schemaIssuerDid = options.schemaIssuerDid;
            this.schemaId = options.schemaId;
            this.schemaName = options.schemaName;
            this.schemaVersion = options.schemaVersion;
            this.credentialDefinitionId = options.credentialDefinitionId;
            this.issuerDid = options.issuerDid;
            this.appendedAttachments = options.attachments;
        }
    }
}
exports.V1ProposeCredentialMessage = V1ProposeCredentialMessage;
V1ProposeCredentialMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/propose-credential');
__decorate([
    (0, core_1.IsValidMessageType)(V1ProposeCredentialMessage.type),
    __metadata("design:type", Object)
], V1ProposeCredentialMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'credential_proposal' }),
    (0, class_transformer_1.Type)(() => V1CredentialPreview_1.V1CredentialPreview),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInstance)(V1CredentialPreview_1.V1CredentialPreview),
    __metadata("design:type", V1CredentialPreview_1.V1CredentialPreview
    /**
     * Filter to request credential based on a particular Schema issuer DID.
     */
    )
], V1ProposeCredentialMessage.prototype, "credentialPreview", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_issuer_did' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedIndyDidRegex),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "schemaIssuerDid", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedSchemaIdRegex),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "schemaId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "schemaName", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'schema_version' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedSchemaVersionRegex, {
        message: 'Version must be X.X or X.X.X',
    }),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "schemaVersion", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'cred_def_id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedCredentialDefinitionIdRegex),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "credentialDefinitionId", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'issuer_did' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(utils_1.unqualifiedIndyDidRegex),
    __metadata("design:type", String)
], V1ProposeCredentialMessage.prototype, "issuerDid", void 0);
//# sourceMappingURL=V1ProposeCredentialMessage.js.map