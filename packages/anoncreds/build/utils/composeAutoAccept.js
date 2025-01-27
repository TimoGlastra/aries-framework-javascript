"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeCredentialAutoAccept = composeCredentialAutoAccept;
exports.composeProofAutoAccept = composeProofAutoAccept;
const core_1 = require("@credo-ts/core");
/**
 * Returns the credential auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptCredential.Never} is returned
 */
function composeCredentialAutoAccept(recordConfig, agentConfig) {
    var _a;
    return (_a = recordConfig !== null && recordConfig !== void 0 ? recordConfig : agentConfig) !== null && _a !== void 0 ? _a : core_1.AutoAcceptCredential.Never;
}
/**
 * Returns the proof auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptProof.Never} is returned
 */
function composeProofAutoAccept(recordConfig, agentConfig) {
    var _a;
    return (_a = recordConfig !== null && recordConfig !== void 0 ? recordConfig : agentConfig) !== null && _a !== void 0 ? _a : core_1.AutoAcceptProof.Never;
}
//# sourceMappingURL=composeAutoAccept.js.map