"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1ProposePresentationHandler = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1ProposePresentationHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V1ProposePresentationMessage];
        this.proofProtocol = proofProtocol;
    }
    async handle(messageContext) {
        const proofRecord = await this.proofProtocol.processProposal(messageContext);
        const shouldAutoRespond = await this.proofProtocol.shouldAutoRespondToProposal(messageContext.agentContext, {
            proofRecord,
            proposalMessage: messageContext.message,
        });
        if (shouldAutoRespond) {
            return await this.acceptProposal(proofRecord, messageContext);
        }
    }
    async acceptProposal(proofRecord, messageContext) {
        messageContext.agentContext.config.logger.info(`Automatically sending request with autoAccept`);
        if (!messageContext.connection) {
            messageContext.agentContext.config.logger.error('No connection on the messageContext, aborting auto accept');
            return;
        }
        const { message } = await this.proofProtocol.acceptProposal(messageContext.agentContext, {
            proofRecord,
        });
        return new core_1.OutboundMessageContext(message, {
            agentContext: messageContext.agentContext,
            connection: messageContext.connection,
            associatedRecord: proofRecord,
        });
    }
}
exports.V1ProposePresentationHandler = V1ProposePresentationHandler;
//# sourceMappingURL=V1ProposePresentationHandler.js.map