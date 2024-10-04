"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSphereonVerifiableCredential = getSphereonVerifiableCredential;
exports.getSphereonVerifiablePresentation = getSphereonVerifiablePresentation;
exports.getVerifiablePresentationFromSphereonWrapped = getVerifiablePresentationFromSphereonWrapped;
const core_1 = require("@credo-ts/core");
function getSphereonVerifiableCredential(verifiableCredential) {
    // encoded sd-jwt or jwt
    if (typeof verifiableCredential === 'string') {
        return verifiableCredential;
    }
    else if (verifiableCredential instanceof core_1.W3cJsonLdVerifiableCredential) {
        return core_1.JsonTransformer.toJSON(verifiableCredential);
    }
    else if (verifiableCredential instanceof core_1.W3cJwtVerifiableCredential) {
        return verifiableCredential.serializedJwt;
    }
    else {
        return verifiableCredential.compact;
    }
}
function getSphereonVerifiablePresentation(verifiablePresentation) {
    // encoded sd-jwt or jwt
    if (typeof verifiablePresentation === 'string') {
        return verifiablePresentation;
    }
    else if (verifiablePresentation instanceof core_1.W3cJsonLdVerifiablePresentation) {
        return core_1.JsonTransformer.toJSON(verifiablePresentation);
    }
    else if (verifiablePresentation instanceof core_1.W3cJwtVerifiablePresentation) {
        return verifiablePresentation.serializedJwt;
    }
    else {
        return verifiablePresentation.compact;
    }
}
function getVerifiablePresentationFromSphereonWrapped(wrappedVerifiablePresentation) {
    if (wrappedVerifiablePresentation.format === 'jwt_vp') {
        if (typeof wrappedVerifiablePresentation.original !== 'string') {
            throw new core_1.CredoError('Unable to transform JWT VP to W3C VP');
        }
        return core_1.W3cJwtVerifiablePresentation.fromSerializedJwt(wrappedVerifiablePresentation.original);
    }
    else if (wrappedVerifiablePresentation.format === 'ldp_vp') {
        return core_1.JsonTransformer.fromJSON(wrappedVerifiablePresentation.original, core_1.W3cJsonLdVerifiablePresentation);
    }
    else if (wrappedVerifiablePresentation.format === 'vc+sd-jwt') {
        // We use some custom logic here so we don't have to re-process the encoded SD-JWT
        const [encodedHeader] = wrappedVerifiablePresentation.presentation.compactSdJwtVc.split('.');
        const header = core_1.JsonEncoder.fromBase64(encodedHeader);
        return {
            compact: wrappedVerifiablePresentation.presentation.compactSdJwtVc,
            header,
            payload: wrappedVerifiablePresentation.presentation.signedPayload,
            prettyClaims: wrappedVerifiablePresentation.presentation.decodedPayload,
        };
    }
    throw new core_1.CredoError(`Unsupported presentation format: ${wrappedVerifiablePresentation.format}`);
}
//# sourceMappingURL=transform.js.map