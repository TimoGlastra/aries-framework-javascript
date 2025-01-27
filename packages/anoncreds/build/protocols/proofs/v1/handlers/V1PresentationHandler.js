"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1PresentationHandler = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1PresentationHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [messages_1.V1PresentationMessage];
        this.proofProtocol = proofProtocol;
    }
    async handle(messageContext) {
        const proofRecord = await this.proofProtocol.processPresentation(messageContext);
        const shouldAutoRespond = await this.proofProtocol.shouldAutoRespondToPresentation(messageContext.agentContext, {
            presentationMessage: messageContext.message,
            proofRecord,
        });
        if (shouldAutoRespond) {
            return await this.acceptPresentation(proofRecord, messageContext);
        }
    }
    async acceptPresentation(proofRecord, messageContext) {
        messageContext.agentContext.config.logger.info(`Automatically sending acknowledgement with autoAccept`);
        const requestMessage = await this.proofProtocol.findRequestMessage(messageContext.agentContext, proofRecord.id);
        if (!requestMessage) {
            throw new core_1.CredoError(`No request message found for proof record with id '${proofRecord.id}'`);
        }
        const { message } = await this.proofProtocol.acceptPresentation(messageContext.agentContext, {
            proofRecord,
        });
        return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
            message,
            lastReceivedMessage: messageContext.message,
            lastSentMessage: requestMessage,
            associatedRecord: proofRecord,
            connectionRecord: messageContext.connection,
        });
    }
}
exports.V1PresentationHandler = V1PresentationHandler;
//# sourceMappingURL=V1PresentationHandler.js.map