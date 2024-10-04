"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenuProblemReportError = void 0;
const core_1 = require("@credo-ts/core");
const messages_1 = require("../messages");
/**
 * @internal
 */
class ActionMenuProblemReportError extends core_1.ProblemReportError {
    constructor(message, { problemCode }) {
        super(message, { problemCode });
        this.message = message;
        this.problemReport = new messages_1.ActionMenuProblemReportMessage({
            description: {
                en: message,
                code: problemCode,
            },
        });
    }
}
exports.ActionMenuProblemReportError = ActionMenuProblemReportError;
//# sourceMappingURL=ActionMenuProblemReportError.js.map