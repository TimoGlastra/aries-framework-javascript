"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCNonceFromCredentialRequest = getCNonceFromCredentialRequest;
const core_1 = require("@credo-ts/core");
/**
 * Extract the 'nonce' parameter from the JWT payload of the credential request.
 */
function getCNonceFromCredentialRequest(credentialRequest) {
    var _a;
    if (!((_a = credentialRequest.proof) === null || _a === void 0 ? void 0 : _a.jwt))
        throw new core_1.CredoError('No jwt in the credentialRequest proof.');
    const jwt = core_1.Jwt.fromSerializedJwt(credentialRequest.proof.jwt);
    if (!jwt.payload.additionalClaims.nonce || typeof jwt.payload.additionalClaims.nonce !== 'string')
        throw new core_1.CredoError('No nonce in the credentialRequest JWT proof payload.');
    return jwt.payload.additionalClaims.nonce;
}
//# sourceMappingURL=credentialRequest.js.map