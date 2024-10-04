"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAskarError = exports.AskarErrorCode = void 0;
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
var AskarErrorCode;
(function (AskarErrorCode) {
    AskarErrorCode[AskarErrorCode["Success"] = 0] = "Success";
    AskarErrorCode[AskarErrorCode["Backend"] = 1] = "Backend";
    AskarErrorCode[AskarErrorCode["Busy"] = 2] = "Busy";
    AskarErrorCode[AskarErrorCode["Duplicate"] = 3] = "Duplicate";
    AskarErrorCode[AskarErrorCode["Encryption"] = 4] = "Encryption";
    AskarErrorCode[AskarErrorCode["Input"] = 5] = "Input";
    AskarErrorCode[AskarErrorCode["NotFound"] = 6] = "NotFound";
    AskarErrorCode[AskarErrorCode["Unexpected"] = 7] = "Unexpected";
    AskarErrorCode[AskarErrorCode["Unsupported"] = 8] = "Unsupported";
    AskarErrorCode[AskarErrorCode["Custom"] = 100] = "Custom";
})(AskarErrorCode || (exports.AskarErrorCode = AskarErrorCode = {}));
const isAskarError = (error, askarErrorCode) => error instanceof aries_askar_shared_1.AriesAskarError && (askarErrorCode === undefined || error.code === askarErrorCode);
exports.isAskarError = isAskarError;
//# sourceMappingURL=askarError.js.map