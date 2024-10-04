"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.didIndyRegex = exports.didIndyRevocationRegistryIdRegex = exports.unqualifiedRevocationRegistryIdRegex = exports.didIndyCredentialDefinitionIdRegex = exports.unqualifiedCredentialDefinitionIdRegex = exports.unqualifiedIndyDidRegex = exports.unqualifiedSchemaVersionRegex = exports.didIndySchemaIdRegex = exports.unqualifiedSchemaIdRegex = void 0;
exports.getUnqualifiedSchemaId = getUnqualifiedSchemaId;
exports.getUnqualifiedCredentialDefinitionId = getUnqualifiedCredentialDefinitionId;
exports.getUnqualifiedRevocationRegistryDefinitionId = getUnqualifiedRevocationRegistryDefinitionId;
exports.isUnqualifiedIndyDid = isUnqualifiedIndyDid;
exports.isUnqualifiedCredentialDefinitionId = isUnqualifiedCredentialDefinitionId;
exports.isUnqualifiedRevocationRegistryId = isUnqualifiedRevocationRegistryId;
exports.isUnqualifiedSchemaId = isUnqualifiedSchemaId;
exports.isDidIndySchemaId = isDidIndySchemaId;
exports.isDidIndyCredentialDefinitionId = isDidIndyCredentialDefinitionId;
exports.isDidIndyRevocationRegistryId = isDidIndyRevocationRegistryId;
exports.parseIndyDid = parseIndyDid;
exports.parseIndySchemaId = parseIndySchemaId;
exports.parseIndyCredentialDefinitionId = parseIndyCredentialDefinitionId;
exports.parseIndyRevocationRegistryId = parseIndyRevocationRegistryId;
exports.getIndyNamespaceFromIndyDid = getIndyNamespaceFromIndyDid;
exports.getUnQualifiedDidIndyDid = getUnQualifiedDidIndyDid;
exports.isIndyDid = isIndyDid;
exports.getQualifiedDidIndyDid = getQualifiedDidIndyDid;
exports.isUnqualifiedDidIndySchema = isUnqualifiedDidIndySchema;
exports.getUnqualifiedDidIndySchema = getUnqualifiedDidIndySchema;
exports.isQualifiedDidIndySchema = isQualifiedDidIndySchema;
exports.getQualifiedDidIndySchema = getQualifiedDidIndySchema;
exports.isUnqualifiedDidIndyCredentialDefinition = isUnqualifiedDidIndyCredentialDefinition;
exports.getUnqualifiedDidIndyCredentialDefinition = getUnqualifiedDidIndyCredentialDefinition;
exports.isQualifiedDidIndyCredentialDefinition = isQualifiedDidIndyCredentialDefinition;
exports.getQualifiedDidIndyCredentialDefinition = getQualifiedDidIndyCredentialDefinition;
exports.isUnqualifiedDidIndyRevocationRegistryDefinition = isUnqualifiedDidIndyRevocationRegistryDefinition;
exports.getUnqualifiedDidIndyRevocationRegistryDefinition = getUnqualifiedDidIndyRevocationRegistryDefinition;
exports.isQualifiedRevocationRegistryDefinition = isQualifiedRevocationRegistryDefinition;
exports.getQualifiedDidIndyRevocationRegistryDefinition = getQualifiedDidIndyRevocationRegistryDefinition;
const core_1 = require("@credo-ts/core");
const didIndyAnonCredsBase = /(did:indy:((?:[a-z][_a-z0-9-]*)(?::[a-z][_a-z0-9-]*)?):([1-9A-HJ-NP-Za-km-z]{21,22}))\/anoncreds\/v0/;
// <namespaceIdentifier>:2:<schemaName>:<schemaVersion>
exports.unqualifiedSchemaIdRegex = /^([a-zA-Z0-9]{21,22}):2:(.+):([0-9.]+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/SCHEMA/<schemaName>/<schemaVersion>
exports.didIndySchemaIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/SCHEMA/(.+)/([0-9.]+)$`);
exports.unqualifiedSchemaVersionRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;
exports.unqualifiedIndyDidRegex = /^(did:sov:)?[a-zA-Z0-9]{21,22}$/;
// <namespaceIdentifier>:3:CL:<schemaSeqNo>:<tag>
exports.unqualifiedCredentialDefinitionIdRegex = /^([a-zA-Z0-9]{21,22}):3:CL:([1-9][0-9]*):(.+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/CLAIM_DEF/<schemaSeqNo>/<tag>
exports.didIndyCredentialDefinitionIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/CLAIM_DEF/([1-9][0-9]*)/(.+)$`);
// <namespaceIdentifier>:4:<namespaceIdentifier>:3:CL:<schemaSeqNo>:<credentialDefinitionTag>:CL_ACCUM:<revocationRegistryTag>
exports.unqualifiedRevocationRegistryIdRegex = /^([a-zA-Z0-9]{21,22}):4:[a-zA-Z0-9]{21,22}:3:CL:([1-9][0-9]*):(.+):CL_ACCUM:(.+)$/;
// did:indy:<namespace>:<namespaceIdentifier>/anoncreds/v0/REV_REG_DEF/<schemaSeqNo>/<credentialDefinitionTag>/<revocationRegistryTag>
exports.didIndyRevocationRegistryIdRegex = new RegExp(`^${didIndyAnonCredsBase.source}/REV_REG_DEF/([1-9][0-9]*)/(.+)/(.+)$`);
exports.didIndyRegex = /^did:indy:((?:[a-z][_a-z0-9-]*)(?::[a-z][_a-z0-9-]*)?):([1-9A-HJ-NP-Za-km-z]{21,22})$/;
function getUnqualifiedSchemaId(unqualifiedDid, name, version) {
    return `${unqualifiedDid}:2:${name}:${version}`;
}
function getUnqualifiedCredentialDefinitionId(unqualifiedDid, schemaSeqNo, tag) {
    return `${unqualifiedDid}:3:CL:${schemaSeqNo}:${tag}`;
}
// TZQuLp43UcYTdtc3HewcDz:4:TZQuLp43UcYTdtc3HewcDz:3:CL:98158:BaustellenzertifikateNU1:CL_ACCUM:1-100
function getUnqualifiedRevocationRegistryDefinitionId(unqualifiedDid, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag) {
    return `${unqualifiedDid}:4:${unqualifiedDid}:3:CL:${schemaSeqNo}:${credentialDefinitionTag}:CL_ACCUM:${revocationRegistryTag}`;
}
function isUnqualifiedIndyDid(did) {
    return exports.unqualifiedIndyDidRegex.test(did);
}
function isUnqualifiedCredentialDefinitionId(credentialDefinitionId) {
    return exports.unqualifiedCredentialDefinitionIdRegex.test(credentialDefinitionId);
}
function isUnqualifiedRevocationRegistryId(revocationRegistryId) {
    return exports.unqualifiedRevocationRegistryIdRegex.test(revocationRegistryId);
}
function isUnqualifiedSchemaId(schemaId) {
    return exports.unqualifiedSchemaIdRegex.test(schemaId);
}
function isDidIndySchemaId(schemaId) {
    return exports.didIndySchemaIdRegex.test(schemaId);
}
function isDidIndyCredentialDefinitionId(credentialDefinitionId) {
    return exports.didIndyCredentialDefinitionIdRegex.test(credentialDefinitionId);
}
function isDidIndyRevocationRegistryId(revocationRegistryId) {
    return exports.didIndyRevocationRegistryIdRegex.test(revocationRegistryId);
}
function parseIndyDid(did) {
    const match = did.match(exports.didIndyRegex);
    if (match) {
        const [, namespace, namespaceIdentifier] = match;
        return { namespace, namespaceIdentifier };
    }
    else {
        throw new core_1.CredoError(`${did} is not a valid did:indy did`);
    }
}
function parseIndySchemaId(schemaId) {
    const didIndyMatch = schemaId.match(exports.didIndySchemaIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaName, schemaVersion] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaName,
            schemaVersion,
            namespace,
        };
    }
    const legacyMatch = schemaId.match(exports.unqualifiedSchemaIdRegex);
    if (legacyMatch) {
        const [, did, schemaName, schemaVersion] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaName,
            schemaVersion,
        };
    }
    throw new Error(`Invalid schema id: ${schemaId}`);
}
function parseIndyCredentialDefinitionId(credentialDefinitionId) {
    const didIndyMatch = credentialDefinitionId.match(exports.didIndyCredentialDefinitionIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaSeqNo, tag] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaSeqNo,
            tag,
            namespace,
        };
    }
    const legacyMatch = credentialDefinitionId.match(exports.unqualifiedCredentialDefinitionIdRegex);
    if (legacyMatch) {
        const [, did, schemaSeqNo, tag] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaSeqNo,
            tag,
        };
    }
    throw new Error(`Invalid credential definition id: ${credentialDefinitionId}`);
}
function parseIndyRevocationRegistryId(revocationRegistryId) {
    const didIndyMatch = revocationRegistryId.match(exports.didIndyRevocationRegistryIdRegex);
    if (didIndyMatch) {
        const [, did, namespace, namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag] = didIndyMatch;
        return {
            did,
            namespaceIdentifier,
            schemaSeqNo,
            credentialDefinitionTag,
            revocationRegistryTag,
            namespace,
        };
    }
    const legacyMatch = revocationRegistryId.match(exports.unqualifiedRevocationRegistryIdRegex);
    if (legacyMatch) {
        const [, did, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag] = legacyMatch;
        return {
            did,
            namespaceIdentifier: did,
            schemaSeqNo,
            credentialDefinitionTag,
            revocationRegistryTag,
        };
    }
    throw new Error(`Invalid revocation registry id: ${revocationRegistryId}`);
}
function getIndyNamespaceFromIndyDid(identifier) {
    let namespace;
    if (isDidIndySchemaId(identifier)) {
        namespace = parseIndySchemaId(identifier).namespace;
    }
    else if (isDidIndyCredentialDefinitionId(identifier)) {
        namespace = parseIndyCredentialDefinitionId(identifier).namespace;
    }
    else if (isDidIndyRevocationRegistryId(identifier)) {
        namespace = parseIndyRevocationRegistryId(identifier).namespace;
    }
    else {
        namespace = parseIndyDid(identifier).namespace;
    }
    if (!namespace)
        throw new core_1.CredoError(`Cannot get indy namespace of identifier '${identifier}'`);
    return namespace;
}
function getUnQualifiedDidIndyDid(identifier) {
    if (isUnqualifiedIndyDid(identifier))
        return identifier;
    if (isDidIndySchemaId(identifier)) {
        const { schemaName, schemaVersion, namespaceIdentifier } = parseIndySchemaId(identifier);
        return getUnqualifiedSchemaId(namespaceIdentifier, schemaName, schemaVersion);
    }
    else if (isDidIndyCredentialDefinitionId(identifier)) {
        const { schemaSeqNo, tag, namespaceIdentifier } = parseIndyCredentialDefinitionId(identifier);
        return getUnqualifiedCredentialDefinitionId(namespaceIdentifier, schemaSeqNo, tag);
    }
    else if (isDidIndyRevocationRegistryId(identifier)) {
        const { namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag } = parseIndyRevocationRegistryId(identifier);
        return getUnqualifiedRevocationRegistryDefinitionId(namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag);
    }
    const { namespaceIdentifier } = parseIndyDid(identifier);
    return namespaceIdentifier;
}
function isIndyDid(identifier) {
    return identifier.startsWith('did:indy:');
}
function getQualifiedDidIndyDid(identifier, namespace) {
    if (isIndyDid(identifier))
        return identifier;
    if (!namespace || typeof namespace !== 'string') {
        throw new core_1.CredoError('Missing required indy namespace');
    }
    if (isUnqualifiedSchemaId(identifier)) {
        const { namespaceIdentifier, schemaName, schemaVersion } = parseIndySchemaId(identifier);
        const schemaId = `did:indy:${namespace}:${namespaceIdentifier}/anoncreds/v0/SCHEMA/${schemaName}/${schemaVersion}`;
        return schemaId;
    }
    else if (isUnqualifiedCredentialDefinitionId(identifier)) {
        const { namespaceIdentifier, schemaSeqNo, tag } = parseIndyCredentialDefinitionId(identifier);
        const credentialDefinitionId = `did:indy:${namespace}:${namespaceIdentifier}/anoncreds/v0/CLAIM_DEF/${schemaSeqNo}/${tag}`;
        return credentialDefinitionId;
    }
    else if (isUnqualifiedRevocationRegistryId(identifier)) {
        const { namespaceIdentifier, schemaSeqNo, credentialDefinitionTag, revocationRegistryTag } = parseIndyRevocationRegistryId(identifier);
        const revocationRegistryId = `did:indy:${namespace}:${namespaceIdentifier}/anoncreds/v0/REV_REG_DEF/${schemaSeqNo}/${credentialDefinitionTag}/${revocationRegistryTag}`;
        return revocationRegistryId;
    }
    else if (isUnqualifiedIndyDid(identifier)) {
        return `did:indy:${namespace}:${identifier}`;
    }
    else {
        throw new core_1.CredoError(`Cannot created qualified indy identifier for '${identifier}' with namespace '${namespace}'`);
    }
}
// -- schema -- //
function isUnqualifiedDidIndySchema(schema) {
    return isUnqualifiedIndyDid(schema.issuerId);
}
function getUnqualifiedDidIndySchema(schema) {
    if (isUnqualifiedDidIndySchema(schema))
        return Object.assign({}, schema);
    if (!isIndyDid(schema.issuerId)) {
        throw new core_1.CredoError(`IssuerId '${schema.issuerId}' is not a valid qualified did-indy did.`);
    }
    const issuerId = getUnQualifiedDidIndyDid(schema.issuerId);
    return Object.assign(Object.assign({}, schema), { issuerId });
}
function isQualifiedDidIndySchema(schema) {
    return !isUnqualifiedIndyDid(schema.issuerId);
}
function getQualifiedDidIndySchema(schema, namespace) {
    if (isQualifiedDidIndySchema(schema))
        return Object.assign({}, schema);
    return Object.assign(Object.assign({}, schema), { issuerId: getQualifiedDidIndyDid(schema.issuerId, namespace) });
}
// -- credential definition -- //
function isUnqualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition) {
    return (isUnqualifiedIndyDid(anonCredsCredentialDefinition.issuerId) &&
        isUnqualifiedSchemaId(anonCredsCredentialDefinition.schemaId));
}
function getUnqualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition) {
    if (isUnqualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition)) {
        return Object.assign({}, anonCredsCredentialDefinition);
    }
    const issuerId = getUnQualifiedDidIndyDid(anonCredsCredentialDefinition.issuerId);
    const schemaId = getUnQualifiedDidIndyDid(anonCredsCredentialDefinition.schemaId);
    return Object.assign(Object.assign({}, anonCredsCredentialDefinition), { issuerId, schemaId });
}
function isQualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition) {
    return (!isUnqualifiedIndyDid(anonCredsCredentialDefinition.issuerId) &&
        !isUnqualifiedSchemaId(anonCredsCredentialDefinition.schemaId));
}
function getQualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition, namespace) {
    if (isQualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition))
        return Object.assign({}, anonCredsCredentialDefinition);
    return Object.assign(Object.assign({}, anonCredsCredentialDefinition), { issuerId: getQualifiedDidIndyDid(anonCredsCredentialDefinition.issuerId, namespace), schemaId: getQualifiedDidIndyDid(anonCredsCredentialDefinition.schemaId, namespace) });
}
// -- revocation registry definition -- //
function isUnqualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition) {
    return (isUnqualifiedIndyDid(revocationRegistryDefinition.issuerId) &&
        isUnqualifiedCredentialDefinitionId(revocationRegistryDefinition.credDefId));
}
function getUnqualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition) {
    if (isUnqualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition)) {
        return Object.assign({}, revocationRegistryDefinition);
    }
    const issuerId = getUnQualifiedDidIndyDid(revocationRegistryDefinition.issuerId);
    const credDefId = getUnQualifiedDidIndyDid(revocationRegistryDefinition.credDefId);
    return Object.assign(Object.assign({}, revocationRegistryDefinition), { issuerId, credDefId });
}
function isQualifiedRevocationRegistryDefinition(revocationRegistryDefinition) {
    return (!isUnqualifiedIndyDid(revocationRegistryDefinition.issuerId) &&
        !isUnqualifiedCredentialDefinitionId(revocationRegistryDefinition.credDefId));
}
function getQualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition, namespace) {
    if (isQualifiedRevocationRegistryDefinition(revocationRegistryDefinition))
        return Object.assign({}, revocationRegistryDefinition);
    return Object.assign(Object.assign({}, revocationRegistryDefinition), { issuerId: getQualifiedDidIndyDid(revocationRegistryDefinition.issuerId, namespace), credDefId: getQualifiedDidIndyDid(revocationRegistryDefinition.credDefId, namespace) });
}
//# sourceMappingURL=indyIdentifiers.js.map