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
exports.V1PresentationAckMessage = void 0;
const core_1 = require("@credo-ts/core");
class V1PresentationAckMessage extends core_1.AckMessage {
    constructor(options) {
        super(options);
        this.allowDidSovPrefix = true;
        this.type = V1PresentationAckMessage.type.messageTypeUri;
    }
}
exports.V1PresentationAckMessage = V1PresentationAckMessage;
V1PresentationAckMessage.type = (0, core_1.parseMessageType)('https://didcomm.org/present-proof/1.0/ack');
__decorate([
    (0, core_1.IsValidMessageType)(V1PresentationAckMessage.type),
    __metadata("design:type", Object)
], V1PresentationAckMessage.prototype, "type", void 0);
//# sourceMappingURL=V1PresentationAckMessage.js.map