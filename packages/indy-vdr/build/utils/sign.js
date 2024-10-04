"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiSignRequest = multiSignRequest;
exports.signRequest = signRequest;
const core_1 = require("@credo-ts/core");
const didIndyUtil_1 = require("../dids/didIndyUtil");
async function multiSignRequest(agentContext, request, signingKey, identifier) {
    const signature = await agentContext.wallet.sign({
        data: core_1.TypedArrayEncoder.fromString(request.signatureInput),
        key: signingKey,
    });
    request.setMultiSignature({
        signature,
        identifier,
    });
    return request;
}
async function signRequest(agentContext, pool, request, submitterDid) {
    const signingKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(agentContext, submitterDid);
    const signedRequest = await pool.prepareWriteRequest(agentContext, request, signingKey);
    return signedRequest;
}
//# sourceMappingURL=sign.js.map