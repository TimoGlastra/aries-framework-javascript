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
exports.V1PresentationMessage = exports.INDY_PROOF_ATTACHMENT_ID = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.INDY_PROOF_ATTACHMENT_ID = 'libindy-presentation-0';
/**
 * Presentation Message part of Present Proof Protocol used as a response to a {@link PresentationRequestMessage | Presentation Request Message} from prover to verifier.
 * Contains signed presentations.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation
 */
class V1PresentationMessage extends core_1.AgentMessage {
    constructor(options) {
        var _a;
        super();
        this.allowDidSovPrefix = true;
        this.type = V1PresentationMessage.type.messageTypeUri;
        if (options) {
            this.id = (_a = options.id) !== null && _a !== void 0 ? _a : this.generateId();
            this.comment = options.comment;
            this.presentationAttachments = options.presentationAttachments;
            this.appendedAttachments = options.attachments;
        }
    }
    get indyProof() {
        var _a, _b;
        const attachment = (_a = this.presentationAttachments.find((attachment) => attachment.id === exports.INDY_PROOF_ATTACHMENT_ID)) !== null && _a !== void 0 ? _a : null;
        const proofJson = (_b = attachment === null || attachment === void 0 ? void 0 : attachment.getDataAsJson()) !== null && _b !== void 0 ? _b : null;
        return proofJson;
    }
    getPresentationAttachmentById(id) {
        return this.presentationAttachments.find((attachment) => attachment.id === id);
    }
}
exports.V1PresentationMessage = V1PresentationMessage;
V1PresentationMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/present-proof/1.0/presentation');
__decorate([
    (0, core_1.IsValidMessageType)(V1PresentationMessage.type),
    __metadata("design:type", Object)
], V1PresentationMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], V1PresentationMessage.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'presentations~attach' }),
    (0, class_transformer_1.Type)(() => core_1.Attachment),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({
        each: true,
    }),
    (0, class_validator_1.IsInstance)(core_1.Attachment, { each: true }),
    __metadata("design:type", Array)
], V1PresentationMessage.prototype, "presentationAttachments", void 0);
//# sourceMappingURL=V1PresentationMessage.js.map