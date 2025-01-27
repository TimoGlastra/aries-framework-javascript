"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrpcResponseHandler = void 0;
const messages_1 = require("../messages");
class DrpcResponseHandler {
    constructor(drpcMessageService) {
        this.supportedMessages = [messages_1.DrpcResponseMessage];
        this.drpcMessageService = drpcMessageService;
    }
    async handle(messageContext) {
        await this.drpcMessageService.receiveResponse(messageContext);
    }
}
exports.DrpcResponseHandler = DrpcResponseHandler;
//# sourceMappingURL=DrpcResponseHandler.js.map