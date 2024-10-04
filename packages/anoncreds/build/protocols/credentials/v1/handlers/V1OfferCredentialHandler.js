"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1OfferCredentialHandler = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1OfferCredentialHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1OfferCredentialMessage];
        this.credentialProtocol = credentialProtocol;
    }
    async handle(messageContext) {
        const credentialRecord = await this.credentialProtocol.processOffer(messageContext);
        const shouldAutoRespond = await this.credentialProtocol.shouldAutoRespondToOffer(messageContext.agentContext, {
            credentialRecord,
            offerMessage: messageContext.message,
        });
        if (shouldAutoRespond) {
            return await this.acceptOffer(credentialRecord, messageContext);
        }
    }
    async acceptOffer(credentialRecord, messageContext) {
        messageContext.agentContext.config.logger.info(`Automatically sending request with autoAccept`);
        const { message } = await this.credentialProtocol.acceptOffer(messageContext.agentContext, { credentialRecord });
        return (0, core_1.getOutboundMessageContext)(messageContext.agentContext, {
            connectionRecord: messageContext.connection,
            message,
            associatedRecord: credentialRecord,
            lastReceivedMessage: messageContext.message,
        });
    }
}
exports.V1OfferCredentialHandler = V1OfferCredentialHandler;
//# sourceMappingURL=V1OfferCredentialHandler.js.map