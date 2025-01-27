"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dcqlGetPresentationsToCreate = dcqlGetPresentationsToCreate;
const mdoc_1 = require("../../mdoc");
const vc_1 = require("../../vc");
function dcqlGetPresentationsToCreate(credentialsForInputDescriptor) {
    const presentationsToCreate = {};
    for (const [credentialQueryId, match] of Object.entries(credentialsForInputDescriptor)) {
        if (match.credentialRecord instanceof vc_1.W3cCredentialRecord) {
            presentationsToCreate[credentialQueryId] = {
                claimFormat: match.credentialRecord.credential.claimFormat === vc_1.ClaimFormat.JwtVc ? vc_1.ClaimFormat.JwtVp : vc_1.ClaimFormat.LdpVp,
                subjectIds: [match.credentialRecord.credential.credentialSubjectIds[0]],
                credentialRecord: match.credentialRecord,
                disclosedPayload: match.disclosedPayload,
            };
        }
        else if (match.credentialRecord instanceof mdoc_1.MdocRecord) {
            presentationsToCreate[credentialQueryId] = {
                claimFormat: vc_1.ClaimFormat.MsoMdoc,
                subjectIds: [],
                credentialRecord: match.credentialRecord,
                disclosedPayload: match.disclosedPayload,
            };
        }
        else {
            presentationsToCreate[credentialQueryId] = {
                claimFormat: vc_1.ClaimFormat.SdJwtVc,
                subjectIds: [],
                credentialRecord: match.credentialRecord,
                disclosedPayload: match.disclosedPayload,
            };
        }
    }
    return presentationsToCreate;
}
//# sourceMappingURL=DcqlPresentationsToCreate.js.map