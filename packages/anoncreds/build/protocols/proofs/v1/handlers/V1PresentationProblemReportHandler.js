"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1PresentationProblemReportHandler = void 0;
const V1PresentationProblemReportMessage_1 = require("../messages/V1PresentationProblemReportMessage");
class V1PresentationProblemReportHandler {
    constructor(proofProtocol) {
        this.supportedMessages = [V1PresentationProblemReportMessage_1.V1PresentationProblemReportMessage];
        this.proofProtocol = proofProtocol;
    }
    async handle(messageContext) {
        await this.proofProtocol.processProblemReport(messageContext);
    }
}
exports.V1PresentationProblemReportHandler = V1PresentationProblemReportHandler;
//# sourceMappingURL=V1PresentationProblemReportHandler.js.map