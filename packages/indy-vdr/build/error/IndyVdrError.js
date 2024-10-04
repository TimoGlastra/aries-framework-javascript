"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrError = void 0;
const core_1 = require("@credo-ts/core");
class IndyVdrError extends core_1.CredoError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndyVdrError = IndyVdrError;
//# sourceMappingURL=IndyVdrError.js.map