"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsError = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsError extends core_1.CredoError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.AnonCredsError = AnonCredsError;
//# sourceMappingURL=AnonCredsError.js.map