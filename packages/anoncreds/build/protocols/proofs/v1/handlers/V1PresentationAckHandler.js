"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1PresentationAckHandler = void 0;
const messages_1 = require("../messages");
class V1PresentationAckHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V1PresentationAckMessage];
        this.proofProtocol = proofProtocol;
    }
    async handle(messageContext) {
        await this.proofProtocol.processAck(messageContext);
    }
}
exports.V1PresentationAckHandler = V1PresentationAckHandler;
//# sourceMappingURL=V1PresentationAckHandler.js.map