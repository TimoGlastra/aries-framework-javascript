"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrNotFoundError = void 0;
const IndyVdrError_1 = require("./IndyVdrError");
class IndyVdrNotFoundError extends IndyVdrError_1.IndyVdrError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.IndyVdrNotFoundError = IndyVdrNotFoundError;
//# sourceMappingURL=IndyVdrNotFound.js.map