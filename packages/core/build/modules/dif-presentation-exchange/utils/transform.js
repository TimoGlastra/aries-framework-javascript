"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSphereonOriginalVerifiableCredential = getSphereonOriginalVerifiableCredential;
exports.getSphereonOriginalVerifiablePresentation = getSphereonOriginalVerifiablePresentation;
exports.getVerifiablePresentationFromEncoded = getVerifiablePresentationFromEncoded;
const crypto_1 = require("../../../crypto");
const utils_1 = require("../../../utils");
const mdoc_1 = require("../../mdoc");
const sd_jwt_vc_1 = require("../../sd-jwt-vc");
const vc_1 = require("../../vc");
function getSphereonOriginalVerifiableCredential(credentialRecord) {
    return credentialRecord.encoded;
}
function getSphereonOriginalVerifiablePresentation(verifiablePresentation) {
    return verifiablePresentation.encoded;
}
// TODO: we might want to move this to some generic vc transformation util
function getVerifiablePresentationFromEncoded(agentContext, encodedVerifiablePresentation) {
    if (typeof encodedVerifiablePresentation === 'string' && encodedVerifiablePresentation.includes('~')) {
        const sdJwtVcApi = agentContext.dependencyManager.resolve(sd_jwt_vc_1.SdJwtVcApi);
        return sdJwtVcApi.fromCompact(encodedVerifiablePresentation);
    }
    else if (typeof encodedVerifiablePresentation === 'string' && crypto_1.Jwt.format.test(encodedVerifiablePresentation)) {
        return vc_1.W3cJwtVerifiablePresentation.fromSerializedJwt(encodedVerifiablePresentation);
    }
    else if (typeof encodedVerifiablePresentation === 'object' && '@context' in encodedVerifiablePresentation) {
        return utils_1.JsonTransformer.fromJSON(encodedVerifiablePresentation, vc_1.W3cJsonLdVerifiablePresentation);
    }
    else {
        return mdoc_1.MdocDeviceResponse.fromBase64Url(encodedVerifiablePresentation);
    }
}
//# sourceMappingURL=transform.js.map