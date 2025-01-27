"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrpcRequestHandler = void 0;
const messages_1 = require("../messages");
class DrpcRequestHandler {
    constructor(drpcMessageService) {
        this.supportedMessages = [messages_1.DrpcRequestMessage];
        this.drpcMessageService = drpcMessageService;
    }
    async handle(messageContext) {
        await this.drpcMessageService.receiveRequest(messageContext);
    }
}
exports.DrpcRequestHandler = DrpcRequestHandler;
//# sourceMappingURL=DrpcRequestHandler.js.map