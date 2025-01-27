"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevocationRegistriesForRequest = getRevocationRegistriesForRequest;
exports.getRevocationRegistriesForProof = getRevocationRegistriesForProof;
const core_1 = require("@credo-ts/core");
const AnonCredsModuleConfig_1 = require("../AnonCredsModuleConfig");
const services_1 = require("../services");
const revocationInterval_1 = require("./revocationInterval");
async function getRevocationRegistriesForRequest(agentContext, proofRequest, selectedCredentials) {
    var _a, _b;
    const revocationRegistries = {};
    // NOTE: we don't want to mutate this object, when modifying we need to always deeply clone objects firsts.
    let updatedSelectedCredentials = selectedCredentials;
    try {
        agentContext.config.logger.debug(`Retrieving revocation registries for proof request`, {
            proofRequest,
            selectedCredentials,
        });
        const referentCredentials = [];
        // Retrieve information for referents and push to single array
        for (const [referent, selectedCredential] of Object.entries(selectedCredentials.attributes)) {
            referentCredentials.push({
                type: 'attributes',
                referent,
                selectedCredential,
                nonRevoked: (_a = proofRequest.requested_attributes[referent].non_revoked) !== null && _a !== void 0 ? _a : proofRequest.non_revoked,
            });
        }
        for (const [referent, selectedCredential] of Object.entries(selectedCredentials.predicates)) {
            referentCredentials.push({
                type: 'predicates',
                referent,
                selectedCredential,
                nonRevoked: (_b = proofRequest.requested_predicates[referent].non_revoked) !== null && _b !== void 0 ? _b : proofRequest.non_revoked,
            });
        }
        const revocationRegistryPromises = [];
        for (const { referent, selectedCredential, nonRevoked, type } of referentCredentials) {
            if (!selectedCredential.credentialInfo) {
                throw new core_1.CredoError(`Credential for referent '${referent} does not have credential info for revocation state creation`);
            }
            // Prefer referent-specific revocation interval over global revocation interval
            const credentialRevocationId = selectedCredential.credentialInfo.credentialRevocationId;
            const revocationRegistryId = selectedCredential.credentialInfo.revocationRegistryId;
            const timestamp = selectedCredential.timestamp;
            // If revocation interval is present and the credential is revocable then create revocation state
            if (nonRevoked && credentialRevocationId && revocationRegistryId) {
                agentContext.config.logger.trace(`Presentation is requesting proof of non revocation for referent '${referent}', creating revocation state for credential`, {
                    nonRevoked,
                    credentialRevocationId,
                    revocationRegistryId,
                    timestamp,
                });
                // Make sure the revocation interval follows best practices from Aries RFC 0441
                (0, revocationInterval_1.assertBestPracticeRevocationInterval)(nonRevoked);
                const registry = agentContext.dependencyManager
                    .resolve(services_1.AnonCredsRegistryService)
                    .getRegistryForIdentifier(agentContext, revocationRegistryId);
                const getRevocationRegistry = async () => {
                    // Fetch revocation registry definition if not in revocation registries list yet
                    if (!revocationRegistries[revocationRegistryId]) {
                        const { revocationRegistryDefinition, resolutionMetadata } = await registry.getRevocationRegistryDefinition(agentContext, revocationRegistryId);
                        if (!revocationRegistryDefinition) {
                            throw new core_1.CredoError(`Could not retrieve revocation registry definition for revocation registry ${revocationRegistryId}: ${resolutionMetadata.message}`);
                        }
                        const tailsFileService = agentContext.dependencyManager.resolve(AnonCredsModuleConfig_1.AnonCredsModuleConfig).tailsFileService;
                        const { tailsFilePath } = await tailsFileService.getTailsFile(agentContext, {
                            revocationRegistryDefinition,
                        });
                        // const tails = await this.indyUtilitiesService.downloadTails(tailsHash, tailsLocation)
                        revocationRegistries[revocationRegistryId] = {
                            definition: revocationRegistryDefinition,
                            tailsFilePath,
                            revocationStatusLists: {},
                        };
                    }
                    // In most cases we will have a timestamp, but if it's not defined, we use the nonRevoked.to value
                    const timestampToFetch = timestamp !== null && timestamp !== void 0 ? timestamp : nonRevoked.to;
                    // Fetch revocation status list if we don't already have a revocation status list for the given timestamp
                    if (!revocationRegistries[revocationRegistryId].revocationStatusLists[timestampToFetch]) {
                        const { revocationStatusList, resolutionMetadata: statusListResolutionMetadata } = await registry.getRevocationStatusList(agentContext, revocationRegistryId, timestampToFetch);
                        if (!revocationStatusList) {
                            throw new core_1.CredoError(`Could not retrieve revocation status list for revocation registry ${revocationRegistryId}: ${statusListResolutionMetadata.message}`);
                        }
                        revocationRegistries[revocationRegistryId].revocationStatusLists[revocationStatusList.timestamp] =
                            revocationStatusList;
                        // If we don't have a timestamp on the selected credential, we set it to the timestamp of the revocation status list
                        // this way we know which revocation status list to use when creating the proof.
                        if (!timestamp) {
                            updatedSelectedCredentials = Object.assign(Object.assign({}, updatedSelectedCredentials), { [type]: Object.assign(Object.assign({}, updatedSelectedCredentials[type]), { [referent]: Object.assign(Object.assign({}, updatedSelectedCredentials[type][referent]), { timestamp: revocationStatusList.timestamp }) }) });
                        }
                    }
                };
                revocationRegistryPromises.push(getRevocationRegistry());
            }
        }
        // await all revocation registry statuses asynchronously
        await Promise.all(revocationRegistryPromises);
        agentContext.config.logger.debug(`Retrieved revocation registries for proof request`, {
            revocationRegistries,
        });
        return { revocationRegistries, updatedSelectedCredentials };
    }
    catch (error) {
        agentContext.config.logger.error(`Error retrieving revocation registry for proof request`, {
            error,
            proofRequest,
            selectedCredentials,
        });
        throw error;
    }
}
async function getRevocationRegistriesForProof(agentContext, proof) {
    const revocationRegistries = {};
    const revocationRegistryPromises = [];
    for (const identifier of proof.identifiers) {
        const revocationRegistryId = identifier.rev_reg_id;
        const timestamp = identifier.timestamp;
        // Skip if no revocation registry id is present
        if (!revocationRegistryId || !timestamp)
            continue;
        const registry = agentContext.dependencyManager
            .resolve(services_1.AnonCredsRegistryService)
            .getRegistryForIdentifier(agentContext, revocationRegistryId);
        const getRevocationRegistry = async () => {
            // Fetch revocation registry definition if not already fetched
            if (!revocationRegistries[revocationRegistryId]) {
                const { revocationRegistryDefinition, resolutionMetadata } = await registry.getRevocationRegistryDefinition(agentContext, revocationRegistryId);
                if (!revocationRegistryDefinition) {
                    throw new core_1.CredoError(`Could not retrieve revocation registry definition for revocation registry ${revocationRegistryId}: ${resolutionMetadata.message}`);
                }
                revocationRegistries[revocationRegistryId] = {
                    definition: revocationRegistryDefinition,
                    revocationStatusLists: {},
                };
            }
            // Fetch revocation status list by timestamp if not already fetched
            if (!revocationRegistries[revocationRegistryId].revocationStatusLists[timestamp]) {
                const { revocationStatusList, resolutionMetadata: statusListResolutionMetadata } = await registry.getRevocationStatusList(agentContext, revocationRegistryId, timestamp);
                if (!revocationStatusList) {
                    throw new core_1.CredoError(`Could not retrieve revocation status list for revocation registry ${revocationRegistryId}: ${statusListResolutionMetadata.message}`);
                }
                revocationRegistries[revocationRegistryId].revocationStatusLists[timestamp] = revocationStatusList;
            }
        };
        revocationRegistryPromises.push(getRevocationRegistry());
    }
    await Promise.all(revocationRegistryPromises);
    return revocationRegistries;
}
//# sourceMappingURL=getRevocationRegistries.js.map