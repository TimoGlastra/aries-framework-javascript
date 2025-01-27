"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsStoreRecordError = void 0;
const AnonCredsError_1 = require("./AnonCredsError");
class AnonCredsStoreRecordError extends AnonCredsError_1.AnonCredsError {
    constructor(message, { cause } = {}) {
        super(message, { cause });
    }
}
exports.AnonCredsStoreRecordError = AnonCredsStoreRecordError;
//# sourceMappingURL=AnonCredsStoreRecordError.js.map