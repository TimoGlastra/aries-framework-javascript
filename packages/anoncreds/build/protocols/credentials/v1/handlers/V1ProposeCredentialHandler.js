"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1ProposeCredentialHandler = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1ProposeCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1ProposeCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    async handle(messageContext) {
        const credentialRecord = await this.credentialProtocol.processProposal(messageContext);
        const shouldAutoAcceptProposal = await this.credentialProtocol.shouldAutoRespondToProposal(messageContext.agentContext, {
            credentialRecord,
            proposalMessage: messageContext.message,
        });
        if (shouldAutoAcceptProposal) {
            return await this.acceptProposal(credentialRecord, messageContext);
        }
    }
    async acceptProposal(credentialRecord, messageContext) {
        messageContext.agentContext.config.logger.info(`Automatically sending offer with autoAccept`);
        if (!messageContext.connection) {
            messageContext.agentContext.config.logger.error('No connection on the messageContext, aborting auto accept');
            return;
        }
        const { message } = await this.credentialProtocol.acceptProposal(messageContext.agentContext, {
            credentialRecord,
        });
        return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
            message,
            connectionRecord: messageContext.connection,
            associatedRecord: credentialRecord,
        });
    }
}
exports.V1ProposeCredentialHandler = V1ProposeCredentialHandler;
//# sourceMappingURL=V1ProposeCredentialHandler.js.map