"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuRequestMessageHandler = void 0;
const messages_1 = require("../messages");
/**
 * @internal
 */
class MenuRequestMessageHandler {
    constructor(actionMenuService) {
        this.supportedMessages = [messages_1.MenuRequestMessage];
        this.actionMenuService = actionMenuService;
    }
    async handle(inboundMessage) {
        inboundMessage.assertReadyConnection();
        await this.actionMenuService.processRequest(inboundMessage);
    }
}
exports.MenuRequestMessageHandler = MenuRequestMessageHandler;
//# sourceMappingURL=MenuRequestMessageHandler.js.map