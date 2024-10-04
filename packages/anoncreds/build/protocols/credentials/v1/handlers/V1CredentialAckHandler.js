"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1CredentialAckHandler = void 0;
const messages_1 = require("../messages");
class V1CredentialAckHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1CredentialAckMessage];
        this.credentialProtocol = credentialProtocol;
    }
    async handle(messageContext) {
        await this.credentialProtocol.processAck(messageContext);
    }
}
exports.V1CredentialAckHandler = V1CredentialAckHandler;
//# sourceMappingURL=V1CredentialAckHandler.js.map