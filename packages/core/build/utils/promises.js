"use strict";
// This file polyfills the allSettled method introduced in ESNext
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSettled = allSettled;
exports.onlyFulfilled = onlyFulfilled;
exports.onlyRejected = onlyRejected;
function allSettled(promises) {
    return Promise.all(promises.map((p) => p
        .then((value) => ({
        status: 'fulfilled',
        value,
    }))
        .catch((reason) => ({
        status: 'rejected',
        reason,
    }))));
}
function onlyFulfilled(entries) {
    // We filter for only the rejected values, so we can safely cast the type
    return entries.filter((e) => e.status === 'fulfilled');
}
function onlyRejected(entries) {
    // We filter for only the rejected values, so we can safely cast the type
    return entries.filter((e) => e.status === 'rejected');
}
//# sourceMappingURL=promises.js.map