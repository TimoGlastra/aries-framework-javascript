"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTxCode = generateTxCode;
function generateTxCode(agentContext, txCode) {
    var _a, _b;
    const length = (_a = txCode.length) !== null && _a !== void 0 ? _a : 4;
    const inputMode = (_b = txCode.input_mode) !== null && _b !== void 0 ? _b : 'numeric';
    const numbers = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const characters = inputMode === 'numeric' ? numbers : numbers + letters;
    const random = agentContext.wallet.getRandomValues(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[random[i] % characters.length];
    }
    return result;
}
//# sourceMappingURL=txCode.js.map