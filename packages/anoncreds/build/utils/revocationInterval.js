"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertBestPracticeRevocationInterval = assertBestPracticeRevocationInterval;
const core_1 = require("@credo-ts/core");
// Check revocation interval in accordance with https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0441-present-proof-best-practices/README.md#semantics-of-non-revocation-interval-endpoints
function assertBestPracticeRevocationInterval(revocationInterval) {
    if (!revocationInterval.to) {
        throw new core_1.CredoError(`Presentation requests proof of non-revocation with no 'to' value specified`);
    }
    if ((revocationInterval.from || revocationInterval.from === 0) && revocationInterval.to !== revocationInterval.from) {
        throw new core_1.CredoError(`Presentation requests proof of non-revocation with an interval from: '${revocationInterval.from}' that does not match the interval to: '${revocationInterval.to}', as specified in Aries RFC 0441`);
    }
}
//# sourceMappingURL=revocationInterval.js.map