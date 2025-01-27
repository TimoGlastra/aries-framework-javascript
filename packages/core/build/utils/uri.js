"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtocolScheme = getProtocolScheme;
function getProtocolScheme(url) {
    const [protocolScheme] = url.split(':');
    return protocolScheme;
}
//# sourceMappingURL=uri.js.map