"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1CredentialProblemReportHandler = void 0;
const messages_1 = require("../messages");
class V1CredentialProblemReportHandler {
    constructor(credentialProtocol) {
        this.supportedMessages = [messages_1.V1CredentialProblemReportMessage];
        this.credentialProtocol = credentialProtocol;
    }
    async handle(messageContext) {
        await this.credentialProtocol.processProblemReport(messageContext);
    }
}
exports.V1CredentialProblemReportHandler = V1CredentialProblemReportHandler;
//# sourceMappingURL=V1CredentialProblemReportHandler.js.map