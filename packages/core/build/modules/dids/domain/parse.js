"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDid = parseDid;
exports.tryParseDid = tryParseDid;
const did_resolver_1 = require("did-resolver");
const error_1 = require("../../../error");
function parseDid(did) {
    const parsed = tryParseDid(did);
    if (!parsed) {
        throw new error_1.CredoError(`Error parsing did '${did}'`);
    }
    return parsed;
}
function tryParseDid(did) {
    return (0, did_resolver_1.parse)(did);
}
//# sourceMappingURL=parse.js.map