"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
//# sourceMappingURL=sleep.js.map