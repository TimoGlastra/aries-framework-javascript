"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indyDidDocumentFromDid = indyDidDocumentFromDid;
exports.createKeyAgreementKey = createKeyAgreementKey;
exports.combineDidDocumentWithJson = combineDidDocumentWithJson;
exports.didDocDiff = didDocDiff;
exports.isSelfCertifiedIndyDid = isSelfCertifiedIndyDid;
exports.indyDidFromNamespaceAndInitialKey = indyDidFromNamespaceAndInitialKey;
exports.verificationKeyForIndyDid = verificationKeyForIndyDid;
exports.getPublicDid = getPublicDid;
exports.getEndpointsForDid = getEndpointsForDid;
exports.buildDidDocument = buildDidDocument;
const anoncreds_1 = require("@credo-ts/anoncreds");
const core_1 = require("@credo-ts/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const error_1 = require("../error");
const didSovUtil_1 = require("./didSovUtil");
// Create a base DIDDoc template according to https://hyperledger.github.io/indy-did-method/#base-diddoc-template
function indyDidDocumentFromDid(did, verKeyBase58) {
    const verificationMethodId = `${did}#verkey`;
    const publicKeyBase58 = verKeyBase58;
    const builder = new core_1.DidDocumentBuilder(did)
        .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
        .addVerificationMethod({
        controller: did,
        id: verificationMethodId,
        publicKeyBase58,
        type: 'Ed25519VerificationKey2018',
    })
        .addAuthentication(verificationMethodId);
    return builder;
}
function createKeyAgreementKey(verkey) {
    return core_1.TypedArrayEncoder.toBase58((0, core_1.convertPublicKeyToX25519)(core_1.TypedArrayEncoder.fromBase58(verkey)));
}
const deepMerge = (a, b) => {
    const output = {};
    [...new Set([...Object.keys(a), ...Object.keys(b)])].forEach((key) => {
        // Only an object includes a given key: just output it
        if (a[key] && !b[key]) {
            output[key] = a[key];
        }
        else if (!a[key] && b[key]) {
            output[key] = b[key];
        }
        else {
            // Both objects do include the key
            // Some or both are arrays
            if (Array.isArray(a[key])) {
                if (Array.isArray(b[key])) {
                    const element = new Set();
                    a[key].forEach((item) => element.add(item));
                    b[key].forEach((item) => element.add(item));
                    output[key] = Array.from(element);
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const arr = a[key];
                    output[key] = Array.from(new Set(...arr, b[key]));
                }
            }
            else if (Array.isArray(b[key])) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const arr = b[key];
                output[key] = Array.from(new Set(...arr, a[key]));
                // Both elements are objects: recursive merge
            }
            else if (typeof a[key] == 'object' && typeof b[key] == 'object') {
                output[key] = deepMerge(a, b);
            }
        }
    });
    return output;
};
/**
 * Combine a JSON content with the contents of a DidDocument
 * @param didDoc object containing original DIDDocument
 * @param json object containing extra DIDDoc contents
 *
 * @returns a DidDocument object resulting from the combination of both
 */
function combineDidDocumentWithJson(didDoc, json) {
    const didDocJson = didDoc.toJSON();
    const combinedJson = deepMerge(didDocJson, json);
    return core_1.JsonTransformer.fromJSON(combinedJson, core_1.DidDocument);
}
/**
 * Processes the difference between a base DidDocument and a complete DidDocument
 *
 * Note: it does deep comparison based only on "id" field to determine whether is
 * the same object or is a different one
 *
 * @param extra complete DidDocument
 * @param base base DidDocument
 * @returns diff object
 */
function didDocDiff(extra, base) {
    const output = {};
    for (const key in extra) {
        if (!(key in base)) {
            output[key] = extra[key];
        }
        else {
            // They are arrays: compare elements
            if (Array.isArray(extra[key]) && Array.isArray(base[key])) {
                // Different types: return the extra
                output[key] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const baseAsArray = base[key];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const extraAsArray = extra[key];
                for (const element of extraAsArray) {
                    if (!baseAsArray.find((item) => item.id === element.id)) {
                        ;
                        output[key].push(element);
                    }
                }
            } // They are both objects: do recursive diff
            else if (typeof extra[key] == 'object' && typeof base[key] == 'object') {
                output[key] = didDocDiff(extra[key], base[key]);
            }
            else {
                output[key] = extra[key];
            }
        }
    }
    return output;
}
/**
 * Check whether the did is a self certifying did. If the verkey is abbreviated this method
 * will always return true. Make sure that the verkey you pass in this method belongs to the
 * did passed in
 *
 * @return Boolean indicating whether the did is self certifying
 */
function isSelfCertifiedIndyDid(did, verkey) {
    const { namespace } = (0, anoncreds_1.parseIndyDid)(did);
    const { did: didFromVerkey } = indyDidFromNamespaceAndInitialKey(namespace, core_1.Key.fromPublicKeyBase58(verkey, core_1.KeyType.Ed25519));
    if (didFromVerkey === did) {
        return true;
    }
    return false;
}
function indyDidFromNamespaceAndInitialKey(namespace, initialKey) {
    const buffer = core_1.Hasher.hash(initialKey.publicKey, 'sha-256');
    const id = core_1.TypedArrayEncoder.toBase58(buffer.slice(0, 16));
    const verkey = initialKey.publicKeyBase58;
    const did = `did:indy:${namespace}:${id}`;
    return { did, id, verkey };
}
/**
 * Fetches the verification key for a given did:indy did and returns the key as a {@link Key} object.
 *
 * @throws {@link CredoError} if the did could not be resolved or the key could not be extracted
 */
async function verificationKeyForIndyDid(agentContext, did) {
    // FIXME: we should store the didDocument in the DidRecord so we don't have to fetch our own did
    // from the ledger to know which key is associated with the did
    const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
    const didResult = await didsApi.resolve(did);
    if (!didResult.didDocument) {
        throw new core_1.CredoError(`Could not resolve did ${did}. ${didResult.didResolutionMetadata.error} ${didResult.didResolutionMetadata.message}`);
    }
    // did:indy dids MUST have a verificationMethod with #verkey
    const verificationMethod = didResult.didDocument.dereferenceKey(`${did}#verkey`);
    const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
    return key;
}
async function getPublicDid(pool, unqualifiedDid) {
    const request = new indy_vdr_shared_1.GetNymRequest({ dest: unqualifiedDid });
    const didResponse = await pool.submitRequest(request);
    if (!didResponse.result.data) {
        throw new error_1.IndyVdrNotFoundError(`DID ${unqualifiedDid} not found in indy namespace ${pool.indyNamespace}`);
    }
    return JSON.parse(didResponse.result.data);
}
async function getEndpointsForDid(agentContext, pool, unqualifiedDid) {
    var _a;
    try {
        agentContext.config.logger.debug(`Get endpoints for did '${unqualifiedDid}' from ledger '${pool.indyNamespace}'`);
        const request = new indy_vdr_shared_1.GetAttribRequest({ targetDid: unqualifiedDid, raw: 'endpoint' });
        agentContext.config.logger.debug(`Submitting get endpoint ATTRIB request for did '${unqualifiedDid}' to ledger '${pool.indyNamespace}'`);
        const response = await pool.submitRequest(request);
        if (!response.result.data) {
            return null;
        }
        const endpoints = (_a = JSON.parse(response.result.data)) === null || _a === void 0 ? void 0 : _a.endpoint;
        agentContext.config.logger.debug(`Got endpoints '${JSON.stringify(endpoints)}' for did '${unqualifiedDid}' from ledger '${pool.indyNamespace}'`, {
            response,
            endpoints,
        });
        return endpoints;
    }
    catch (error) {
        agentContext.config.logger.error(`Error retrieving endpoints for did '${unqualifiedDid}' from ledger '${pool.indyNamespace}'`, {
            error,
        });
        throw new error_1.IndyVdrError(error);
    }
}
async function buildDidDocument(agentContext, pool, did) {
    const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(did);
    const nym = await getPublicDid(pool, namespaceIdentifier);
    // Create base Did Document
    // For modern did:indy DIDs, we assume that GET_NYM is always a full verkey in base58.
    // For backwards compatibility, we accept a shortened verkey and convert it using previous convention
    const verkey = (0, didSovUtil_1.getFullVerkey)(namespaceIdentifier, nym.verkey);
    const builder = indyDidDocumentFromDid(did, verkey);
    // If GET_NYM does not return any diddocContent, fallback to legacy GET_ATTRIB endpoint
    if (!nym.diddocContent) {
        const keyAgreementId = `${did}#key-agreement-1`;
        const endpoints = await getEndpointsForDid(agentContext, pool, namespaceIdentifier);
        if (endpoints) {
            builder
                .addContext('https://w3id.org/security/suites/x25519-2019/v1')
                .addVerificationMethod({
                controller: did,
                id: keyAgreementId,
                publicKeyBase58: createKeyAgreementKey(verkey),
                type: 'X25519KeyAgreementKey2019',
            })
                .addKeyAgreement(keyAgreementId);
            // Process endpoint attrib following the same rules as for did:sov
            (0, didSovUtil_1.addServicesFromEndpointsAttrib)(builder, did, endpoints, keyAgreementId);
        }
        return builder.build();
    }
    else {
        // Combine it with didDoc
        let diddocContent;
        try {
            diddocContent = JSON.parse(nym.diddocContent);
        }
        catch (error) {
            agentContext.config.logger.error(`Nym diddocContent is not a valid json string: ${diddocContent}`);
            throw new error_1.IndyVdrError(`Nym diddocContent failed to parse as JSON: ${error}`);
        }
        return combineDidDocumentWithJson(builder.build(), diddocContent);
    }
}
//# sourceMappingURL=didIndyUtil.js.map