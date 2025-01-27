"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformMessageHandler = void 0;
const messages_1 = require("../messages");
/**
 * @internal
 */
class PerformMessageHandler {
    constructor(actionMenuService) {
        this.supportedMessages = [messages_1.PerformMessage];
        this.actionMenuService = actionMenuService;
    }
    async handle(inboundMessage) {
        inboundMessage.assertReadyConnection();
        await this.actionMenuService.processPerform(inboundMessage);
    }
}
exports.PerformMessageHandler = PerformMessageHandler;
//# sourceMappingURL=PerformMessageHandler.js.map