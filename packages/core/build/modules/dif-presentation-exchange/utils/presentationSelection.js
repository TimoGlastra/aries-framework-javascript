"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPresentationsWithDescriptorsFromSubmission = extractPresentationsWithDescriptorsFromSubmission;
const jsonpath_1 = require("@astronautlabs/jsonpath");
const error_1 = require("../../../error");
const mdoc_1 = require("../../mdoc");
const vc_1 = require("../../vc");
function extractPresentationsWithDescriptorsFromSubmission(presentations, submission, definition) {
    return submission.descriptor_map.map((descriptor) => {
        const [presentation] = jsonpath_1.JSONPath.query(presentations, descriptor.path);
        const inputDescriptor = definition.input_descriptors.find(({ id }) => id === descriptor.id);
        if (!presentation) {
            throw new error_1.CredoError(`Unable to extract presentation at path '${descriptor.path}' for submission descriptor '${descriptor.id}'`);
        }
        if (!inputDescriptor) {
            throw new Error(`Unable to extract input descriptor '${descriptor.id}' from definition '${definition.id}' for submission '${submission.id}'`);
        }
        if (presentation instanceof mdoc_1.MdocDeviceResponse) {
            const document = presentation.documents.find((document) => document.docType === descriptor.id);
            if (!document) {
                throw new Error(`Unable to extract mdoc document with doctype '${descriptor.id}' from mdoc device response for submission '${submission.id}'.`);
            }
            return {
                format: vc_1.ClaimFormat.MsoMdoc,
                descriptor,
                presentation,
                credential: document,
                inputDescriptor,
            };
        }
        else if (presentation instanceof vc_1.W3cJwtVerifiablePresentation ||
            presentation instanceof vc_1.W3cJsonLdVerifiablePresentation) {
            if (!descriptor.path_nested) {
                throw new Error(`Submission descriptor '${descriptor.id}' for submission '${submission.id}' has no 'path_nested' but presentation is format '${presentation.claimFormat}'`);
            }
            const [verifiableCredential] = jsonpath_1.JSONPath.query(
            // Path is `$.vp.verifiableCredential[]` in case of jwt vp
            presentation.claimFormat === vc_1.ClaimFormat.JwtVp ? { vp: presentation } : presentation, descriptor.path_nested.path);
            if (!verifiableCredential) {
                throw new error_1.CredoError(`Unable to extract credential at path '${descriptor.path_nested.path}' from presentation at path '${descriptor.path}' for submission descriptor '${descriptor.id}'`);
            }
            return {
                format: presentation.claimFormat,
                descriptor,
                presentation,
                credential: verifiableCredential,
                inputDescriptor,
            };
        }
        else {
            return {
                format: vc_1.ClaimFormat.SdJwtVc,
                descriptor,
                presentation,
                credential: presentation,
                inputDescriptor,
            };
        }
    });
}
//# sourceMappingURL=presentationSelection.js.map