"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNoDuplicateGroupsNamesInProofRequest = assertNoDuplicateGroupsNamesInProofRequest;
const core_1 = require("@credo-ts/core");
function attributeNamesToArray(proofRequest) {
    // Attributes can contain either a `name` string value or an `names` string array. We reduce it to a single array
    // containing all attribute names from the requested attributes.
    return Object.values(proofRequest.requested_attributes).reduce((names, a) => [...names, ...(a.name ? [a.name] : a.names ? a.names : [])], []);
}
function predicateNamesToArray(proofRequest) {
    return Array.from(new Set(Object.values(proofRequest.requested_predicates).map((a) => a.name)));
}
// TODO: This is still not ideal. The requested groups can specify different credentials using restrictions.
function assertNoDuplicateGroupsNamesInProofRequest(proofRequest) {
    const attributes = attributeNamesToArray(proofRequest);
    const predicates = predicateNamesToArray(proofRequest);
    const duplicates = predicates.filter((item) => attributes.indexOf(item) !== -1);
    if (duplicates.length > 0) {
        throw new core_1.CredoError(`The proof request contains duplicate predicates and attributes: ${duplicates.toString()}`);
    }
}
//# sourceMappingURL=hasDuplicateGroupNames.js.map