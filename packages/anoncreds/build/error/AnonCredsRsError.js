"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRsError = void 0;
const AnonCredsError_1 = require("./AnonCredsError");
class AnonCredsRsError extends AnonCredsError_1.AnonCredsError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.AnonCredsRsError = AnonCredsRsError;
//# sourceMappingURL=AnonCredsRsError.js.map