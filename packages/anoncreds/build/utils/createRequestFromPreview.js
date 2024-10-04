"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestFromPreview = createRequestFromPreview;
const core_1 = require("@credo-ts/core");
function createRequestFromPreview({ name, version, nonce, attributes, predicates, nonRevokedInterval, }) {
    var _a;
    const proofRequest = {
        name,
        version,
        nonce,
        requested_attributes: {},
        requested_predicates: {},
    };
    /**
     * Create mapping of attributes by referent. This required the
     * attributes to come from the same credential.
     * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#referent
     *
     * {
     *  "referent1": [Attribute1, Attribute2],
     *  "referent2": [Attribute3]
     * }
     */
    const attributesByReferent = {};
    for (const proposedAttributes of attributes !== null && attributes !== void 0 ? attributes : []) {
        const referent = (_a = proposedAttributes.referent) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
        const referentAttributes = attributesByReferent[referent];
        // Referent key already exist, add to list
        if (referentAttributes) {
            referentAttributes.push(proposedAttributes);
        }
        // Referent key does not exist yet, create new entry
        else {
            attributesByReferent[referent] = [proposedAttributes];
        }
    }
    // Transform attributes by referent to requested attributes
    for (const [referent, proposedAttributes] of Object.entries(attributesByReferent)) {
        // Either attributeName or attributeNames will be undefined
        const attributeName = proposedAttributes.length == 1 ? proposedAttributes[0].name : undefined;
        const attributeNames = proposedAttributes.length > 1 ? proposedAttributes.map((a) => a.name) : undefined;
        proofRequest.requested_attributes[referent] = {
            name: attributeName,
            names: attributeNames,
            restrictions: [
                {
                    cred_def_id: proposedAttributes[0].credentialDefinitionId,
                },
            ],
        };
    }
    // Transform proposed predicates to requested predicates
    for (const proposedPredicate of predicates !== null && predicates !== void 0 ? predicates : []) {
        proofRequest.requested_predicates[core_1.utils.uuid()] = {
            name: proposedPredicate.name,
            p_type: proposedPredicate.predicate,
            p_value: proposedPredicate.threshold,
            restrictions: [
                {
                    cred_def_id: proposedPredicate.credentialDefinitionId,
                },
            ],
        };
    }
    // TODO: local non_revoked?
    if (nonRevokedInterval) {
        proofRequest.non_revoked = nonRevokedInterval;
    }
    return proofRequest;
}
//# sourceMappingURL=createRequestFromPreview.js.map