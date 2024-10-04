"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyBackend = void 0;
var KeyBackend;
(function (KeyBackend) {
    /**
     *
     * Generate a key using common software-based implementations.
     * Key material will be instantiated in memory.
     *
     * Supported for almost all, if not all, key types.
     *
     */
    KeyBackend["Software"] = "Software";
    /**
     *
     * Generate a key within the secure element of the device.
     *
     * For now, this is only supported using Aries Askar in iOS or Android for `KeyType.P256`.
     *
     */
    KeyBackend["SecureElement"] = "SecureElement";
})(KeyBackend || (exports.KeyBackend = KeyBackend = {}));
//# sourceMappingURL=KeyBackend.js.map