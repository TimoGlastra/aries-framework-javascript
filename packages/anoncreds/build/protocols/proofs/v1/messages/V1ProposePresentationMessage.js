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
exports.V1ProposePresentationMessage = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const V1PresentationPreview_1 = require("../models/V1PresentationPreview");
/**
 * Propose Presentation Message part of Present Proof Protocol used to initiate presentation exchange by holder.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#propose-presentation
 */
class V1ProposePresentationMessage extends core_1.AgentMessage {
    constructor(options) {
        var _a;
        super();
        this.allowDidSovPrefix = true;
        this.type = V1ProposePresentationMessage.type.messageTypeUri;
        if (options) {
            this.id = (_a = options.id) !== null && _a !== void 0 ? _a : this.generateId();
            this.comment = options.comment;
            this.presentationProposal = options.presentationProposal;
        }
    }
}
exports.V1ProposePresentationMessage = V1ProposePresentationMessage;
V1ProposePresentationMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/present-proof/1.0/propose-presentation');
__decorate([
    (0, core_1.IsValidMessageType)(V1ProposePresentationMessage.type),
    __metadata("design:type", Object)
], V1ProposePresentationMessage.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], V1ProposePresentationMessage.prototype, "comment", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'presentation_proposal' }),
    (0, class_transformer_1.Type)(() => V1PresentationPreview_1.V1PresentationPreview),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsInstance)(V1PresentationPreview_1.V1PresentationPreview),
    __metadata("design:type", V1PresentationPreview_1.V1PresentationPreview)
], V1ProposePresentationMessage.prototype, "presentationProposal", void 0);
//# sourceMappingURL=V1ProposePresentationMessage.js.map