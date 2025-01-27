"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64ToBase64URL = base64ToBase64URL;
function base64ToBase64URL(base64) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
//# sourceMappingURL=base64.js.map