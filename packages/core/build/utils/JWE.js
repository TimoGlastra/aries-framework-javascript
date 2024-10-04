"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJweStructure = isValidJweStructure;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidJweStructure(message) {
    return Boolean(message &&
        typeof message === 'object' &&
        message !== null &&
        typeof message.protected === 'string' &&
        message.iv &&
        message.ciphertext &&
        message.tag);
}
//# sourceMappingURL=JWE.js.map