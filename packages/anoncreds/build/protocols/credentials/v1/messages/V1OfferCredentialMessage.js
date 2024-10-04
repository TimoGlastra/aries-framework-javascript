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
exports.V1OfferCredentialMessage = exports.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const V1CredentialPreview_1 = require("./V1CredentialPreview");
exports.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID = 'libindy-cred-offer-0';
/**
 * Message part of Issue Credential Protocol used to continue or initiate credential exchange by issuer.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#offer-credential
 */
class V1OfferCredentialMessage extends core_1.AgentMessage {
    constructor(options) {
        super();
        this.allowDidSovPrefix = true;
        this.type = V1OfferCredentialMessage.type.messageTypeUri;
        if (options) {
            this.id = options.id || this.generateId();
            this.comment = options.comment;
            this.credentialPreview = options.credentialPreview;
            this.offerAttachments = options.offerAttachments;
            this.appendedAttachments = options.attachments;
        }
    }
    get indyCredentialOffer() {
        var _a;
        const attachment = this.offerAttachments.find((attachment) => attachment.id === exports.INDY_CREDENTIAL_OFFER_ATTACHMENT_ID);
        // Extract credential offer from attachment
        const credentialOfferJson = (_a = attachment === null || attachment === void 0 ? void 0 : attachment.getDataAsJson()) !== null && _a !== void 0 ? _a : null;
        return credentialOfferJson;
    }
    getOfferAttachmentById(id) {
        return this.offerAttachments.find((attachment) => attachment.id === id);
    }
}
exports.V1OfferCredentialMessage = V1OfferCredentialMessage;
V1OfferCredentialMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/offer-credential');
__decorate([
    (0, core_1.IsValidMessageType)(V1OfferCredentialMessage.type),
    __metadata("design:type", Object)
], V1OfferCredentialMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1OfferCredentialMessage.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'credential_preview' }),
    (0, class_transformer_1.Type)(() => V1CredentialPreview_1.V1CredentialPreview),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(V1CredentialPreview_1.V1CredentialPreview),
    __metadata("design:type", V1CredentialPreview_1.V1CredentialPreview)
], V1OfferCredentialMessage.prototype, "credentialPreview", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'offers~attach' }),
    (0, class_transformer_1.Type)(() => core_1.Attachment),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({
        each: true,
    }),
    (0, class_validator_1.IsInstance)(core_1.Attachment, { each: true }),
    __metadata("design:type", Array)
], V1OfferCredentialMessage.prototype, "offerAttachments", void 0);
//# sourceMappingURL=V1OfferCredentialMessage.js.map