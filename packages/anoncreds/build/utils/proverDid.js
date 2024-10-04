"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLegacyProverDidLikeString = generateLegacyProverDidLikeString;
const core_1 = require("@credo-ts/core");
/**
 * generates a string that adheres to the format of a legacy indy did.
 *
 * This can be used for the `prover_did` property that is required in the legacy anoncreds credential
 * request. This doesn't actually have to be a did, but some frameworks (like ACA-Py) require it to be
 * an unqualified indy did.
 */
function generateLegacyProverDidLikeString() {
    return core_1.TypedArrayEncoder.toBase58(core_1.TypedArrayEncoder.fromString(core_1.utils.uuid()).slice(0, 16));
}
//# sourceMappingURL=proverDid.js.map