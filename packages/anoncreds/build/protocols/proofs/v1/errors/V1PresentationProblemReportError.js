"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1PresentationProblemReportError = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
class V1PresentationProblemReportError extends core_1.ProblemReportError {
    constructor(message, { problemCode }) {
        super(message, { problemCode });
        this.message = message;
        this.problemReport = new messages_1.V1PresentationProblemReportMessage({
            description: {
                en: message,
                code: problemCode,
            },
        });
    }
}
exports.V1PresentationProblemReportError = V1PresentationProblemReportError;
//# sourceMappingURL=V1PresentationProblemReportError.js.map