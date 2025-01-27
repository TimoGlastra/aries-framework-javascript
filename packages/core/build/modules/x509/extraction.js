"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractX509CertificatesFromJwt = extractX509CertificatesFromJwt;
const X509Certificate_1 = require("./X509Certificate");
function extractX509CertificatesFromJwt(jwt) {
    var _a;
    return (_a = jwt.header.x5c) === null || _a === void 0 ? void 0 : _a.map((cert) => X509Certificate_1.X509Certificate.fromEncodedCertificate(cert));
}
//# sourceMappingURL=extraction.js.map