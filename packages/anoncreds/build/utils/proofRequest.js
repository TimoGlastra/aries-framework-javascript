"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proofRequestUsesUnqualifiedIdentifiers = proofRequestUsesUnqualifiedIdentifiers;
const indyIdentifiers_1 = require("./indyIdentifiers");
function proofRequestUsesUnqualifiedIdentifiers(proofRequest) {
    // We assume that if any identifier is unqualified, all of them are unqualified as well
    return [
        ...Object.values(proofRequest.requested_attributes),
        ...Object.values(proofRequest.requested_predicates),
    ].some((attribute) => {
        var _a;
        return (_a = attribute.restrictions) === null || _a === void 0 ? void 0 : _a.some((restriction) => (restriction.cred_def_id && (0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(restriction.cred_def_id)) ||
            (restriction.schema_id && (0, indyIdentifiers_1.isUnqualifiedSchemaId)(restriction.schema_id)) ||
            (restriction.issuer_did && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(restriction.issuer_did)) ||
            (restriction.issuer_id && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(restriction.issuer_id)) ||
            (restriction.schema_issuer_did && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(restriction.schema_issuer_did)) ||
            (restriction.schema_issuer_id && (0, indyIdentifiers_1.isUnqualifiedIndyDid)(restriction.schema_issuer_id)) ||
            (restriction.rev_reg_id && (0, indyIdentifiers_1.isUnqualifiedRevocationRegistryId)(restriction.rev_reg_id)));
    });
}
//# sourceMappingURL=proofRequest.js.map