"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAskarWallet = assertAskarWallet;
const core_1 = require("@credo-ts/core");
const wallet_1 = require("../wallet");
function assertAskarWallet(wallet) {
    var _a, _b;
    if (!(wallet instanceof wallet_1.AskarProfileWallet) && !(wallet instanceof wallet_1.AskarWallet)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const walletClassName = (_b = (_a = wallet.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'unknown';
        throw new core_1.CredoError(`Expected wallet to be instance of AskarProfileWallet or AskarWallet, found ${walletClassName}`);
    }
}
//# sourceMappingURL=assertAskarWallet.js.map