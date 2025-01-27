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
exports.V1RequestCredentialMessage = exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = 'libindy-cred-request-0';
class V1RequestCredentialMessage extends core_1.AgentMessage {
    constructor(options) {
        super();
        this.allowDidSovPrefix = true;
        this.type = V1RequestCredentialMessage.type.messageTypeUri;
        if (options) {
            this.id = options.id || this.generateId();
            this.comment = options.comment;
            this.requestAttachments = options.requestAttachments;
            this.appendedAttachments = options.attachments;
        }
    }
    get indyCredentialRequest() {
        var _a;
        const attachment = this.requestAttachments.find((attachment) => attachment.id === exports.INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID);
        // Extract proof request from attachment
        const credentialReqJson = (_a = attachment === null || attachment === void 0 ? void 0 : attachment.getDataAsJson()) !== null && _a !== void 0 ? _a : null;
        return credentialReqJson;
    }
    getRequestAttachmentById(id) {
        return this.requestAttachments.find((attachment) => attachment.id === id);
    }
}
exports.V1RequestCredentialMessage = V1RequestCredentialMessage;
V1RequestCredentialMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/request-credential');
__decorate([
    (0, core_1.IsValidMessageType)(V1RequestCredentialMessage.type),
    __metadata("design:type", Object)
], V1RequestCredentialMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1RequestCredentialMessage.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'requests~attach' }),
    (0, class_transformer_1.Type)(() => core_1.Attachment),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({
        each: true,
    }),
    (0, class_validator_1.IsInstance)(core_1.Attachment, { each: true }),
    __metadata("design:type", Array)
], V1RequestCredentialMessage.prototype, "requestAttachments", void 0);
//# sourceMappingURL=V1RequestCredentialMessage.js.map