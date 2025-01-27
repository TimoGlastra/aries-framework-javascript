"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCrv = hasCrv;
exports.hasKty = hasKty;
exports.hasX = hasX;
exports.hasY = hasY;
exports.hasValidUse = hasValidUse;
function hasCrv(jwk, crv) {
    return 'crv' in jwk && jwk.crv === crv;
}
function hasKty(jwk, kty) {
    return 'kty' in jwk && jwk.kty === kty;
}
function hasX(jwk) {
    return 'x' in jwk && jwk.x !== undefined;
}
function hasY(jwk) {
    return 'y' in jwk && jwk.y !== undefined;
}
function hasValidUse(jwk, { supportsSigning, supportsEncrypting }) {
    return jwk.use === undefined || (supportsSigning && jwk.use === 'sig') || (supportsEncrypting && jwk.use === 'enc');
}
//# sourceMappingURL=validate.js.map