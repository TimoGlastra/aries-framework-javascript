"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialsForRequest = getCredentialsForRequest;
const pex_1 = require("@animo-id/pex");
const core_1 = require("@animo-id/pex/dist/main/lib/evaluation/core");
const jsonpath_1 = require("@astronautlabs/jsonpath");
const decode_1 = require("@sd-jwt/decode");
const pex_models_1 = require("@sphereon/pex-models");
const crypto_1 = require("../../../crypto");
const error_1 = require("../../../error");
const mdoc_1 = require("../../mdoc");
const Mdoc_1 = require("../../mdoc/Mdoc");
const MdocDeviceResponse_1 = require("../../mdoc/MdocDeviceResponse");
const sd_jwt_vc_1 = require("../../sd-jwt-vc");
const vc_1 = require("../../vc");
const DifPresentationExchangeError_1 = require("../DifPresentationExchangeError");
const transform_1 = require("./transform");
async function getCredentialsForRequest(
// PEX instance with hasher defined
pex, presentationDefinition, credentialRecords) {
    var _a, _b, _c, _d;
    const encodedCredentials = credentialRecords.map(transform_1.getSphereonOriginalVerifiableCredential);
    const selectResultsRaw = pex.selectFrom(presentationDefinition, encodedCredentials);
    const selectResults = Object.assign(Object.assign({}, selectResultsRaw), { matches: (_a = selectResultsRaw.matches) !== null && _a !== void 0 ? _a : [], 
        // Map the encoded credential to their respective credential record
        verifiableCredential: (_c = (_b = selectResultsRaw.verifiableCredential) === null || _b === void 0 ? void 0 : _b.map((selectedEncoded, index) => {
            var _a;
            const credentialRecordIndex = (_a = selectResultsRaw.vcIndexes) === null || _a === void 0 ? void 0 : _a[index];
            if (credentialRecordIndex === undefined || credentialRecordIndex === -1) {
                throw new DifPresentationExchangeError_1.DifPresentationExchangeError('Unable to find credential in credential records.');
            }
            const credentialRecord = credentialRecords[credentialRecordIndex];
            if (credentialRecord instanceof sd_jwt_vc_1.SdJwtVcRecord) {
                // selectedEncoded always string when SdJwtVcRecord
                // Get the decoded payload from the the selected credential, this already has SD applied
                const { jwt, disclosures } = (0, decode_1.decodeSdJwtSync)(selectedEncoded, crypto_1.Hasher.hash);
                const prettyClaims = (0, decode_1.getClaimsSync)(jwt.payload, disclosures, crypto_1.Hasher.hash);
                return {
                    type: vc_1.ClaimFormat.SdJwtVc,
                    credentialRecord,
                    disclosedPayload: prettyClaims,
                };
            }
            else if (credentialRecord instanceof mdoc_1.MdocRecord) {
                return {
                    type: vc_1.ClaimFormat.MsoMdoc,
                    credentialRecord,
                    disclosedPayload: {},
                };
            }
            else if (credentialRecord instanceof vc_1.W3cCredentialRecord) {
                return {
                    type: credentialRecord.credential.claimFormat,
                    credentialRecord,
                };
            }
            else {
                throw new error_1.CredoError(`Unrecognized credential record type`);
            }
        })) !== null && _c !== void 0 ? _c : [] });
    const presentationSubmission = {
        requirements: [],
        areRequirementsSatisfied: false,
        name: presentationDefinition.name,
        purpose: presentationDefinition.purpose,
    };
    // If there's no submission requirements, ALL input descriptors MUST be satisfied
    if (!presentationDefinition.submission_requirements || presentationDefinition.submission_requirements.length === 0) {
        presentationSubmission.requirements = getSubmissionRequirementsForAllInputDescriptors(presentationDefinition.input_descriptors, selectResults);
    }
    else {
        presentationSubmission.requirements = getSubmissionRequirements(presentationDefinition, selectResults);
    }
    const allEntries = presentationSubmission.requirements.flatMap((requirement) => requirement.submissionEntry);
    const inputDescriptorsForMdocCredential = new Map();
    for (const entry of allEntries)
        for (const verifiableCredential of entry.verifiableCredentials) {
            if (verifiableCredential.type !== vc_1.ClaimFormat.MsoMdoc)
                continue;
            const set = (_d = inputDescriptorsForMdocCredential.get(verifiableCredential)) !== null && _d !== void 0 ? _d : new Set();
            set.add(entry.inputDescriptorId);
            inputDescriptorsForMdocCredential.set(verifiableCredential, set);
        }
    // NOTE: it might be better to apply disclosure per credential/match (as that's also how mdoc does this)
    // however this doesn't work very well in wallets, as you usually won't show the same credential twice with
    // different disclosed attributes
    // Apply limit disclosure for all mdocs
    for (const [verifiableCredential, inputDescriptorIds] of inputDescriptorsForMdocCredential.entries()) {
        if (verifiableCredential.type !== vc_1.ClaimFormat.MsoMdoc)
            continue;
        const inputDescriptorsForCredential = presentationDefinition.input_descriptors.filter(({ id }) => inputDescriptorIds.has(id));
        const mdoc = Mdoc_1.Mdoc.fromBase64Url(verifiableCredential.credentialRecord.base64Url);
        verifiableCredential.disclosedPayload = MdocDeviceResponse_1.MdocDeviceResponse.limitDisclosureToInputDescriptor({
            inputDescriptor: {
                id: mdoc.docType,
                format: {
                    mso_mdoc: {
                        alg: [],
                    },
                },
                constraints: {
                    limit_disclosure: 'required',
                    fields: inputDescriptorsForCredential.flatMap((i) => { var _a, _b; return (_b = (_a = i.constraints) === null || _a === void 0 ? void 0 : _a.fields) !== null && _b !== void 0 ? _b : []; }),
                },
            },
            mdoc: Mdoc_1.Mdoc.fromBase64Url(verifiableCredential.credentialRecord.base64Url),
        });
    }
    // There may be no requirements if we filter out all optional ones. To not makes things too complicated, we see it as an error
    // for now if a request is made that has no required requirements (but only e.g. min: 0, which means we don't need to disclose anything)
    // I see this more as the fault of the presentation definition, as it should have at least some requirements.
    if (presentationSubmission.requirements.length === 0) {
        throw new DifPresentationExchangeError_1.DifPresentationExchangeError('Presentation Definition does not require any credentials. Optional credentials are not included in the presentation submission.');
    }
    if (selectResults.areRequiredCredentialsPresent === pex_1.Status.ERROR) {
        return presentationSubmission;
    }
    return Object.assign(Object.assign({}, presentationSubmission), { 
        // If all requirements are satisfied, the presentation submission is satisfied
        areRequirementsSatisfied: presentationSubmission.requirements.every((requirement) => requirement.isRequirementSatisfied) });
}
function getSubmissionRequirements(presentationDefinition, selectResults) {
    var _a;
    const submissionRequirements = [];
    const matches = selectResults.matches;
    if (!matches.every((match) => match.type === core_1.SubmissionRequirementMatchType.SubmissionRequirement && match.from)) {
        throw new DifPresentationExchangeError_1.DifPresentationExchangeError(`Expected all matches to be of type '${core_1.SubmissionRequirementMatchType.SubmissionRequirement}' with 'from' key.`);
    }
    // There are submission requirements, so we need to select the input_descriptors
    // based on the submission requirements
    (_a = presentationDefinition.submission_requirements) === null || _a === void 0 ? void 0 : _a.forEach((submissionRequirement, submissionRequirementIndex) => {
        // Check: if the submissionRequirement uses `from_nested`, as we don't support this yet
        if (submissionRequirement.from_nested) {
            throw new DifPresentationExchangeError_1.DifPresentationExchangeError("Presentation definition contains requirement using 'from_nested', which is not supported yet.");
        }
        // Check if there's a 'from'. If not the structure is not as we expect it
        if (!submissionRequirement.from) {
            throw new DifPresentationExchangeError_1.DifPresentationExchangeError("Missing 'from' in submission requirement match");
        }
        const match = matches.find((match) => match.id === submissionRequirementIndex);
        if (!match) {
            throw new Error(`Unable to find a match for submission requirement with index '${submissionRequirementIndex}'`);
        }
        if (submissionRequirement.rule === pex_models_1.Rules.All) {
            const selectedSubmission = getSubmissionRequirementRuleAll(submissionRequirement, presentationDefinition, selectResults.verifiableCredential, match);
            submissionRequirements.push(selectedSubmission);
        }
        else {
            const selectedSubmission = getSubmissionRequirementRulePick(submissionRequirement, presentationDefinition, selectResults.verifiableCredential, match);
            submissionRequirements.push(selectedSubmission);
        }
    });
    // Submission may have requirement that doesn't require a credential to be submitted (e.g. min: 0)
    // We use minimization strategy, and thus only disclose the minimum amount of information
    const requirementsWithCredentials = submissionRequirements.filter((requirement) => requirement.needsCount > 0);
    return requirementsWithCredentials;
}
function getSubmissionRequirementsForAllInputDescriptors(inputDescriptors, selectResults) {
    const submissionRequirements = [];
    const matches = selectResults.matches;
    if (!matches.every((match) => match.type === core_1.SubmissionRequirementMatchType.InputDescriptor)) {
        throw new DifPresentationExchangeError_1.DifPresentationExchangeError(`Expected all matches to be of type '${core_1.SubmissionRequirementMatchType.InputDescriptor}' when.`);
    }
    for (const inputDescriptor of inputDescriptors) {
        const submission = getSubmissionForInputDescriptor(inputDescriptor, selectResults.verifiableCredential, matches);
        submissionRequirements.push({
            rule: pex_models_1.Rules.Pick,
            needsCount: 1, // Every input descriptor is a distinct requirement, so the count is always 1,
            submissionEntry: [submission],
            isRequirementSatisfied: submission.verifiableCredentials.length >= 1,
        });
    }
    return submissionRequirements;
}
function getSubmissionRequirementRuleAll(submissionRequirement, presentationDefinition, verifiableCredentials, match) {
    var _a;
    // Check if there's a 'from'. If not the structure is not as we expect it
    if (!submissionRequirement.from)
        throw new DifPresentationExchangeError_1.DifPresentationExchangeError("Missing 'from' in submission requirement match.");
    const selectedSubmission = {
        rule: pex_models_1.Rules.All,
        needsCount: 0,
        name: submissionRequirement.name,
        purpose: submissionRequirement.purpose,
        submissionEntry: [],
        isRequirementSatisfied: false,
    };
    for (const inputDescriptor of presentationDefinition.input_descriptors) {
        // We only want to get the submission if the input descriptor belongs to the group
        if (!((_a = inputDescriptor.group) === null || _a === void 0 ? void 0 : _a.includes(match.from)))
            continue;
        const submission = getSubmissionForInputDescriptor(inputDescriptor, verifiableCredentials, match.input_descriptors);
        // Rule ALL, so for every input descriptor that matches in this group, we need to add it
        selectedSubmission.needsCount += 1;
        selectedSubmission.submissionEntry.push(submission);
    }
    return Object.assign(Object.assign({}, selectedSubmission), { 
        // If all submissions have a credential, the requirement is satisfied
        isRequirementSatisfied: selectedSubmission.submissionEntry.every((submission) => submission.verifiableCredentials.length >= 1) });
}
function getSubmissionRequirementRulePick(submissionRequirement, presentationDefinition, verifiableCredentials, match) {
    var _a, _b, _c;
    // Check if there's a 'from'. If not the structure is not as we expect it
    if (!submissionRequirement.from) {
        throw new DifPresentationExchangeError_1.DifPresentationExchangeError("Missing 'from' in submission requirement match.");
    }
    const selectedSubmission = {
        rule: pex_models_1.Rules.Pick,
        needsCount: (_b = (_a = submissionRequirement.count) !== null && _a !== void 0 ? _a : submissionRequirement.min) !== null && _b !== void 0 ? _b : 1,
        name: submissionRequirement.name,
        purpose: submissionRequirement.purpose,
        // If there's no count, min, or max we assume one credential is required for submission
        // however, the exact behavior is not specified in the spec
        submissionEntry: [],
        isRequirementSatisfied: false,
    };
    const satisfiedSubmissions = [];
    const unsatisfiedSubmissions = [];
    for (const inputDescriptor of presentationDefinition.input_descriptors) {
        // We only want to get the submission if the input descriptor belongs to the group
        if (!((_c = inputDescriptor.group) === null || _c === void 0 ? void 0 : _c.includes(match.from)))
            continue;
        const submission = getSubmissionForInputDescriptor(inputDescriptor, verifiableCredentials, match.input_descriptors);
        if (submission.verifiableCredentials.length >= 1) {
            satisfiedSubmissions.push(submission);
        }
        else {
            unsatisfiedSubmissions.push(submission);
        }
        // If we have found enough credentials to satisfy the requirement, we could stop
        // but the user may not want the first x that match, so we continue and return all matches
        // if (satisfiedSubmissions.length === selectedSubmission.needsCount) break
    }
    return Object.assign(Object.assign({}, selectedSubmission), { 
        // If there are enough satisfied submissions, the requirement is satisfied
        isRequirementSatisfied: satisfiedSubmissions.length >= selectedSubmission.needsCount, 
        // if the requirement is satisfied, we only need to return the satisfied submissions
        // however if the requirement is not satisfied, we include all entries so the wallet could
        // render which credentials are missing.
        submissionEntry: satisfiedSubmissions.length >= selectedSubmission.needsCount
            ? satisfiedSubmissions
            : [...satisfiedSubmissions, ...unsatisfiedSubmissions] });
}
function getSubmissionForInputDescriptor(inputDescriptor, verifiableCredentials, matches) {
    const matchesForInputDescriptor = matches.filter((m) => m.id === inputDescriptor.id);
    const submissionEntry = {
        inputDescriptorId: inputDescriptor.id,
        name: inputDescriptor.name,
        purpose: inputDescriptor.purpose,
        verifiableCredentials: matchesForInputDescriptor.flatMap((matchForInputDescriptor) => extractCredentialsFromInputDescriptorMatch(matchForInputDescriptor, verifiableCredentials)),
    };
    // return early if no matches.
    if (!(matchesForInputDescriptor === null || matchesForInputDescriptor === void 0 ? void 0 : matchesForInputDescriptor.length))
        return submissionEntry;
    return submissionEntry;
}
function extractCredentialsFromInputDescriptorMatch(match, availableCredentials) {
    const verifiableCredentials = [];
    for (const vcPath of match.vc_path) {
        const [verifiableCredential] = jsonpath_1.JSONPath.query({ verifiableCredential: availableCredentials }, vcPath);
        verifiableCredentials.push(verifiableCredential);
    }
    return verifiableCredentials;
}
//# sourceMappingURL=credentialSelection.js.map