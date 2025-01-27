"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrpcErrorCode = void 0;
var DrpcErrorCode;
(function (DrpcErrorCode) {
    DrpcErrorCode[DrpcErrorCode["METHOD_NOT_FOUND"] = -32601] = "METHOD_NOT_FOUND";
    DrpcErrorCode[DrpcErrorCode["PARSE_ERROR"] = -32700] = "PARSE_ERROR";
    DrpcErrorCode[DrpcErrorCode["INVALID_REQUEST"] = -32600] = "INVALID_REQUEST";
    DrpcErrorCode[DrpcErrorCode["INVALID_PARAMS"] = -32602] = "INVALID_PARAMS";
    DrpcErrorCode[DrpcErrorCode["INTERNAL_ERROR"] = -32603] = "INTERNAL_ERROR";
    DrpcErrorCode[DrpcErrorCode["SERVER_ERROR"] = -32000] = "SERVER_ERROR";
})(DrpcErrorCode || (exports.DrpcErrorCode = DrpcErrorCode = {}));
//# sourceMappingURL=DrpcErrorCodes.js.map