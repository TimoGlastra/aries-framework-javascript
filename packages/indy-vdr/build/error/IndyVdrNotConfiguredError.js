"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrNotConfiguredError = void 0;
const IndyVdrError_1 = require("./IndyVdrError");
class IndyVdrNotConfiguredError extends IndyVdrError_1.IndyVdrError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndyVdrNotConfiguredError = IndyVdrNotConfiguredError;
//# sourceMappingURL=IndyVdrNotConfiguredError.js.map