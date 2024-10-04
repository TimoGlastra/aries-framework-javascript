"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuMessageHandler = void 0;
const messages_1 = require("../messages");
/**
 * @internal
 */
class MenuMessageHandler {
    constructor(actionMenuService) {
        this.supportedMessages = [messages_1.MenuMessage];
        this.actionMenuService = actionMenuService;
    }
    async handle(inboundMessage) {
        inboundMessage.assertReadyConnection();
        await this.actionMenuService.processMenu(inboundMessage);
    }
}
exports.MenuMessageHandler = MenuMessageHandler;
//# sourceMappingURL=MenuMessageHandler.js.map