"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getW3cAnonCredsCredentialMetadata = void 0;
exports.getRevocationMetadata = getRevocationMetadata;
const core_1 = require("@credo-ts/core");
const anoncreds_shared_1 = require("@hyperledger/anoncreds-shared");
const AnonCredsModuleConfig_1 = require("../AnonCredsModuleConfig");
const utils_1 = require("../utils");
async function getRevocationMetadata(agentContext, credentialRevocationMetadata, mustHaveTimeStamp = false) {
    let nonRevokedIntervalOverride;
    const { revocationRegistryId, revocationRegistryIndex, nonRevokedInterval, timestamp } = credentialRevocationMetadata;
    if (!revocationRegistryId || !nonRevokedInterval || (mustHaveTimeStamp && !timestamp)) {
        throw new core_1.CredoError('Invalid revocation metadata');
    }
    // Make sure the revocation interval follows best practices from Aries RFC 0441
    (0, utils_1.assertBestPracticeRevocationInterval)(nonRevokedInterval);
    const { revocationRegistryDefinition: anonCredsRevocationRegistryDefinition } = await (0, utils_1.fetchRevocationRegistryDefinition)(agentContext, revocationRegistryId);
    const tailsFileService = agentContext.dependencyManager.resolve(AnonCredsModuleConfig_1.AnonCredsModuleConfig).tailsFileService;
    const { tailsFilePath } = await tailsFileService.getTailsFile(agentContext, {
        revocationRegistryDefinition: anonCredsRevocationRegistryDefinition,
    });
    const timestampToFetch = timestamp !== null && timestamp !== void 0 ? timestamp : nonRevokedInterval.to;
    if (!timestampToFetch)
        throw new core_1.CredoError('Timestamp to fetch is required');
    const { revocationStatusList: _revocationStatusList } = await (0, utils_1.fetchRevocationStatusList)(agentContext, revocationRegistryId, timestampToFetch);
    const updatedTimestamp = timestamp !== null && timestamp !== void 0 ? timestamp : _revocationStatusList.timestamp;
    const revocationRegistryDefinition = anoncreds_shared_1.RevocationRegistryDefinition.fromJson(anonCredsRevocationRegistryDefinition);
    const revocationStatusList = anoncreds_shared_1.RevocationStatusList.fromJson(_revocationStatusList);
    const revocationState = revocationRegistryIndex
        ? anoncreds_shared_1.CredentialRevocationState.create({
            revocationRegistryIndex: Number(revocationRegistryIndex),
            revocationRegistryDefinition: revocationRegistryDefinition,
            tailsPath: tailsFilePath,
            revocationStatusList,
        })
        : undefined;
    const requestedFrom = nonRevokedInterval.from;
    if (requestedFrom && requestedFrom > timestampToFetch) {
        const { revocationStatusList: overrideRevocationStatusList } = await (0, utils_1.fetchRevocationStatusList)(agentContext, revocationRegistryId, requestedFrom);
        const vdrTimestamp = overrideRevocationStatusList === null || overrideRevocationStatusList === void 0 ? void 0 : overrideRevocationStatusList.timestamp;
        if (vdrTimestamp && vdrTimestamp === timestampToFetch) {
            nonRevokedIntervalOverride = {
                overrideRevocationStatusListTimestamp: timestampToFetch,
                requestedFromTimestamp: requestedFrom,
                revocationRegistryDefinitionId: revocationRegistryId,
            };
        }
        else {
            throw new core_1.CredoError(`VDR timestamp for ${requestedFrom} does not correspond to the one provided in proof identifiers. Expected: ${updatedTimestamp} and received ${vdrTimestamp}`);
        }
    }
    return {
        updatedTimestamp,
        revocationRegistryId,
        revocationRegistryDefinition,
        revocationStatusList,
        nonRevokedIntervalOverride,
        revocationState,
    };
}
const getW3cAnonCredsCredentialMetadata = (w3cJsonLdVerifiableCredential) => {
    const w3cJsonLdVerifiableCredentialJson = core_1.JsonTransformer.toJSON(w3cJsonLdVerifiableCredential);
    const { schemaId, credentialDefinitionId, revocationRegistryId } = anoncreds_shared_1.W3cCredential.fromJson(w3cJsonLdVerifiableCredentialJson);
    return {
        schemaId,
        credentialDefinitionId,
        revocationRegistryId,
    };
};
exports.getW3cAnonCredsCredentialMetadata = getW3cAnonCredsCredentialMetadata;
//# sourceMappingURL=utils.js.map