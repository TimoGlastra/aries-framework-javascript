"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FULL_VERKEY_REGEX = void 0;
exports.isFullVerkey = isFullVerkey;
exports.getFullVerkey = getFullVerkey;
exports.sovDidDocumentFromDid = sovDidDocumentFromDid;
exports.endpointsAttribFromServices = endpointsAttribFromServices;
exports.addServicesFromEndpointsAttrib = addServicesFromEndpointsAttrib;
const core_1 = require("@credo-ts/core");
exports.FULL_VERKEY_REGEX = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
/**
 * Check a base58 encoded string against a regex expression to determine if it is a full valid verkey
 * @param verkey Base58 encoded string representation of a verkey
 * @return Boolean indicating if the string is a valid verkey
 */
function isFullVerkey(verkey) {
    return exports.FULL_VERKEY_REGEX.test(verkey);
}
function getFullVerkey(did, verkey) {
    var _a;
    if (isFullVerkey(verkey))
        return verkey;
    // Did could have did:xxx prefix, only take the last item after :
    const id = (_a = did.split(':').pop()) !== null && _a !== void 0 ? _a : did;
    // Verkey is prefixed with ~ if abbreviated
    const verkeyWithoutTilde = verkey.slice(1);
    // Create base58 encoded public key (32 bytes)
    return core_1.TypedArrayEncoder.toBase58(core_1.Buffer.concat([
        // Take did identifier (16 bytes)
        core_1.TypedArrayEncoder.fromBase58(id),
        // Concat the abbreviated verkey (16 bytes)
        core_1.TypedArrayEncoder.fromBase58(verkeyWithoutTilde),
    ]));
}
function sovDidDocumentFromDid(fullDid, verkey) {
    const verificationMethodId = `${fullDid}#key-1`;
    const keyAgreementId = `${fullDid}#key-agreement-1`;
    const publicKeyBase58 = getFullVerkey(fullDid, verkey);
    const publicKeyX25519 = core_1.TypedArrayEncoder.toBase58((0, core_1.convertPublicKeyToX25519)(core_1.TypedArrayEncoder.fromBase58(publicKeyBase58)));
    const builder = new core_1.DidDocumentBuilder(fullDid)
        .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
        .addContext('https://w3id.org/security/suites/x25519-2019/v1')
        .addVerificationMethod({
        controller: fullDid,
        id: verificationMethodId,
        publicKeyBase58: publicKeyBase58,
        type: 'Ed25519VerificationKey2018',
    })
        .addVerificationMethod({
        controller: fullDid,
        id: keyAgreementId,
        publicKeyBase58: publicKeyX25519,
        type: 'X25519KeyAgreementKey2019',
    })
        .addAuthentication(verificationMethodId)
        .addAssertionMethod(verificationMethodId)
        .addKeyAgreement(keyAgreementId);
    return builder;
}
// Process Indy Attrib Endpoint Types according to: https://sovrin-foundation.github.io/sovrin/spec/did-method-spec-template.html > Read (Resolve) > DID Service Endpoint
function processEndpointTypes(types) {
    const expectedTypes = ['endpoint', 'did-communication', 'DIDComm', 'DIDCommMessaging'];
    const defaultTypes = ['endpoint', 'did-communication'];
    // Return default types if types "is NOT present [or] empty"
    if (!types || types.length <= 0) {
        return defaultTypes;
    }
    // Return default types if types "contain any other values"
    for (const type of types) {
        if (!expectedTypes.includes(type)) {
            return defaultTypes;
        }
    }
    // Return provided types
    return types;
}
function endpointsAttribFromServices(services) {
    var _a;
    const commTypes = ['endpoint', 'did-communication', 'DIDComm', 'DIDCommMessaging'];
    const commServices = services.filter((item) => commTypes.includes(item.type));
    const endpoint = commServices[0] instanceof core_1.NewDidCommV2Service
        ? commServices[0].firstServiceEndpointUri
        : commServices[0].serviceEndpoint;
    if (typeof endpoint !== 'string') {
        throw new core_1.CredoError(`For unknown service endpoint types (${commServices[0].type}) the 'serviceEndpoint' needs to be of type 'string'`);
    }
    // Check that all services use the same endpoint, as only one is accepted
    if (!commServices.every((item) => (item instanceof core_1.NewDidCommV2Service ? item.firstServiceEndpointUri : item.serviceEndpoint) === endpoint)) {
        throw new core_1.CredoError('serviceEndpoint for all services must match');
    }
    const types = [];
    const routingKeys = new Set();
    for (const commService of commServices) {
        const commServiceType = commService.type;
        if (types.includes(commServiceType)) {
            throw new core_1.CredoError('Only a single communication service per type is supported');
        }
        types.push(commServiceType);
        if ((commService instanceof core_1.DidCommV1Service || commService instanceof core_1.DidCommV2Service) &&
            commService.routingKeys) {
            commService.routingKeys.forEach((item) => routingKeys.add(item));
        }
        else if (commService instanceof core_1.NewDidCommV2Service) {
            const firstServiceEndpoint = Array.isArray(commService.serviceEndpoint)
                ? commService.serviceEndpoint[0]
                : commService.serviceEndpoint;
            (_a = firstServiceEndpoint.routingKeys) === null || _a === void 0 ? void 0 : _a.forEach((item) => routingKeys.add(item));
        }
    }
    return { endpoint, types, routingKeys: Array.from(routingKeys) };
}
function addServicesFromEndpointsAttrib(builder, did, endpoints, keyAgreementId) {
    const { endpoint, routingKeys, types } = endpoints, otherEndpoints = __rest(endpoints, ["endpoint", "routingKeys", "types"]);
    if (endpoint) {
        const processedTypes = processEndpointTypes(types);
        // If 'endpoint' included in types, add id to the services array
        if (processedTypes.includes('endpoint')) {
            builder.addService(new core_1.DidDocumentService({
                id: `${did}#endpoint`,
                serviceEndpoint: endpoint,
                type: 'endpoint',
            }));
        }
        // If 'did-communication' included in types, add DIDComm v1 entry
        if (processedTypes.includes('did-communication')) {
            builder.addService(new core_1.DidCommV1Service({
                id: `${did}#did-communication`,
                serviceEndpoint: endpoint,
                priority: 0,
                routingKeys: routingKeys !== null && routingKeys !== void 0 ? routingKeys : [],
                recipientKeys: [keyAgreementId],
                accept: ['didcomm/aip2;env=rfc19'],
            }));
        }
        // If 'DIDCommMessaging' included in types, add DIDComm v2 entry
        if (processedTypes.includes('DIDCommMessaging')) {
            builder
                .addService(new core_1.NewDidCommV2Service({
                id: `${did}#didcomm-messaging-1`,
                serviceEndpoint: new core_1.NewDidCommV2ServiceEndpoint({
                    uri: endpoint,
                    routingKeys: routingKeys,
                    accept: ['didcomm/v2'],
                }),
            }))
                .addContext('https://didcomm.org/messaging/contexts/v2');
        }
        // If 'DIDComm' included in types, add legacy DIDComm v2 entry
        if (processedTypes.includes('DIDComm')) {
            builder
                .addService(new core_1.DidCommV2Service({
                id: `${did}#didcomm-1`,
                routingKeys: routingKeys,
                accept: ['didcomm/v2'],
                serviceEndpoint: endpoint,
            }))
                .addContext('https://didcomm.org/messaging/contexts/v2');
        }
    }
    // Add other endpoint types
    for (const [type, endpoint] of Object.entries(otherEndpoints)) {
        builder.addService(new core_1.DidDocumentService({
            id: `${did}#${type}`,
            serviceEndpoint: endpoint,
            type,
        }));
    }
}
//# sourceMappingURL=didSovUtil.js.map