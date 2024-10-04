"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = fetchWithTimeout;
const abort_controller_1 = require("abort-controller");
async function fetchWithTimeout(fetch, url, init) {
    var _a;
    const abortController = new abort_controller_1.AbortController();
    const timeoutMs = (_a = init === null || init === void 0 ? void 0 : init.timeoutMs) !== null && _a !== void 0 ? _a : 5000;
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);
    try {
        return await fetch(url, Object.assign(Object.assign({}, init), { signal: abortController.signal }));
    }
    finally {
        clearTimeout(timeout);
    }
}
//# sourceMappingURL=fetch.js.map