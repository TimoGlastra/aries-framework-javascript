"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1IssueCredentialHandler = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1IssueCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1IssueCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    async handle(messageContext) {
        const credentialRecord = await this.credentialProtocol.processCredential(messageContext);
        const shouldAutoRespond = await this.credentialProtocol.shouldAutoRespondToCredential(messageContext.agentContext, {
            credentialRecord,
            credentialMessage: messageContext.message,
        });
        if (shouldAutoRespond) {
            return await this.acceptCredential(credentialRecord, messageContext);
        }
    }
    async acceptCredential(credentialRecord, messageContext) {
        messageContext.agentContext.config.logger.info(`Automatically sending acknowledgement with autoAccept`);
        const { message } = await this.credentialProtocol.acceptCredential(messageContext.agentContext, {
            credentialRecord,
        });
        const requestMessage = await this.credentialProtocol.findRequestMessage(messageContext.agentContext, credentialRecord.id);
        if (!requestMessage) {
            throw new core_1.CredoError(`No request message found for credential record with id '${credentialRecord.id}'`);
        }
        return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
            connectionRecord: messageContext.connection,
            message,
            associatedRecord: credentialRecord,
            lastReceivedMessage: messageContext.message,
            lastSentMessage: requestMessage,
        });
    }
}
exports.V1IssueCredentialHandler = V1IssueCredentialHandler;
//# sourceMappingURL=V1IssueCredentialHandler.js.map