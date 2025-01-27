"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenuProblemReportHandler = void 0;
const messages_1 = require("../messages");
/**
 * @internal
 */
class ActionMenuProblemReportHandler {
    constructor(actionMenuService) {
        this.supportedMessages = [messages_1.ActionMenuProblemReportMessage];
        this.actionMenuService = actionMenuService;
    }
    async handle(messageContext) {
        await this.actionMenuService.processProblemReport(messageContext);
    }
}
exports.ActionMenuProblemReportHandler = ActionMenuProblemReportHandler;
//# sourceMappingURL=ActionMenuProblemReportHandler.js.map