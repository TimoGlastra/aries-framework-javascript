"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcqlError = void 0;
const error_1 = require("../../error");
class DcqlError extends error_1.CredoError {
    constructor(message, { cause, additionalMessages } = {}) {
        super(message, { cause });
        this.additionalMessages = additionalMessages;
    }
}
exports.DcqlError = DcqlError;
//# sourceMappingURL=DcqlError.js.map