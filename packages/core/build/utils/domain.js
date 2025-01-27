"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainFromUrl = getDomainFromUrl;
function getDomainFromUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with "https://"');
    }
    const regex = /[#/?]/;
    const domain = url.split('://')[1].split(regex)[0];
    return domain;
}
//# sourceMappingURL=domain.js.map