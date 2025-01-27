"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSphereonVerifiableCredential = getSphereonVerifiableCredential;
exports.getSphereonVerifiablePresentation = getSphereonVerifiablePresentation;
exports.getVerifiablePresentationFromSphereonWrapped = getVerifiablePresentationFromSphereonWrapped;
const core_1 = require("@credo-ts/core");
function getSphereonVerifiableCredential(verifiableCredential) {
    return verifiableCredential.encoded;
}
function getSphereonVerifiablePresentation(verifiablePresentation) {
    return verifiablePresentation.encoded;
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
            encoded: wrappedVerifiablePresentation.presentation.compactSdJwtVc,
            header,
            payload: wrappedVerifiablePresentation.presentation.signedPayload,
            prettyClaims: wrappedVerifiablePresentation.presentation.decodedPayload,
            claimFormat: core_1.ClaimFormat.SdJwtVc,
        };
    }
    else if (wrappedVerifiablePresentation.format === 'mso_mdoc') {
        if (typeof wrappedVerifiablePresentation.original !== 'string') {
            const base64Url = core_1.TypedArrayEncoder.toBase64URL(new Uint8Array(wrappedVerifiablePresentation.original.cborEncode()));
            return core_1.MdocDeviceResponse.fromBase64Url(base64Url);
        }
        return core_1.MdocDeviceResponse.fromBase64Url(wrappedVerifiablePresentation.original);
    }
    throw new core_1.CredoError(`Unsupported presentation format: ${wrappedVerifiablePresentation.format}`);
}
//# sourceMappingURL=transform.js.map