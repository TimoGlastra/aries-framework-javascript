"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialsForAnonCredsProofRequest = void 0;
const services_1 = require("../services");
const anonCredsObjects_1 = require("./anonCredsObjects");
const revocationInterval_1 = require("./revocationInterval");
const sortRequestedCredentialsMatches_1 = require("./sortRequestedCredentialsMatches");
const timestamp_1 = require("./timestamp");
const getCredentialsForProofRequestReferent = async (agentContext, proofRequest, attributeReferent) => {
    const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
    const credentials = await holderService.getCredentialsForProofRequest(agentContext, {
        proofRequest,
        attributeReferent,
    });
    return credentials;
};
const getRevocationStatus = async (agentContext, proofRequest, requestedItem, credentialInfo) => {
    var _a, _b;
    const requestNonRevoked = (_a = requestedItem.non_revoked) !== null && _a !== void 0 ? _a : proofRequest.non_revoked;
    const credentialRevocationId = credentialInfo.credentialRevocationId;
    const revocationRegistryId = credentialInfo.revocationRegistryId;
    // If revocation interval is not present or the credential is not revocable then we
    // don't need to fetch the revocation status
    if (!requestNonRevoked || credentialRevocationId === null || !revocationRegistryId) {
        return { isRevoked: undefined, timestamp: undefined };
    }
    agentContext.config.logger.trace(`Fetching credential revocation status for credential revocation id '${credentialRevocationId}' with revocation interval with from '${requestNonRevoked.from}' and to '${requestNonRevoked.to}'`);
    // Make sure the revocation interval follows best practices from Aries RFC 0441
    (0, revocationInterval_1.assertBestPracticeRevocationInterval)(requestNonRevoked);
    const { revocationStatusList } = await (0, anonCredsObjects_1.fetchRevocationStatusList)(agentContext, revocationRegistryId, (_b = requestNonRevoked.to) !== null && _b !== void 0 ? _b : (0, timestamp_1.dateToTimestamp)(new Date()));
    const isRevoked = revocationStatusList.revocationList[parseInt(credentialRevocationId)] === 1;
    agentContext.config.logger.trace(`Credential with credential revocation index '${credentialRevocationId}' is ${isRevoked ? '' : 'not '}revoked with revocation interval with to '${requestNonRevoked.to}' & from '${requestNonRevoked.from}'`);
    return {
        isRevoked,
        timestamp: revocationStatusList.timestamp,
    };
};
const getCredentialsForAnonCredsProofRequest = async (agentContext, proofRequest, options) => {
    const credentialsForProofRequest = {
        attributes: {},
        predicates: {},
    };
    for (const [referent, requestedAttribute] of Object.entries(proofRequest.requested_attributes)) {
        const credentials = await getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
        credentialsForProofRequest.attributes[referent] = (0, sortRequestedCredentialsMatches_1.sortRequestedCredentialsMatches)(await Promise.all(credentials.map(async (credential) => {
            const { isRevoked, timestamp } = await getRevocationStatus(agentContext, proofRequest, requestedAttribute, credential.credentialInfo);
            return {
                credentialId: credential.credentialInfo.credentialId,
                revealed: true,
                credentialInfo: credential.credentialInfo,
                timestamp,
                revoked: isRevoked,
            };
        })));
        // We only attach revoked state if non-revocation is requested. So if revoked is true it means
        // the credential is not applicable to the proof request
        if (options.filterByNonRevocationRequirements) {
            credentialsForProofRequest.attributes[referent] = credentialsForProofRequest.attributes[referent].filter((r) => !r.revoked);
        }
    }
    for (const [referent, requestedPredicate] of Object.entries(proofRequest.requested_predicates)) {
        const credentials = await getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
        credentialsForProofRequest.predicates[referent] = (0, sortRequestedCredentialsMatches_1.sortRequestedCredentialsMatches)(await Promise.all(credentials.map(async (credential) => {
            const { isRevoked, timestamp } = await getRevocationStatus(agentContext, proofRequest, requestedPredicate, credential.credentialInfo);
            return {
                credentialId: credential.credentialInfo.credentialId,
                credentialInfo: credential.credentialInfo,
                timestamp,
                revoked: isRevoked,
            };
        })));
        // We only attach revoked state if non-revocation is requested. So if revoked is true it means
        // the credential is not applicable to the proof request
        if (options.filterByNonRevocationRequirements) {
            credentialsForProofRequest.predicates[referent] = credentialsForProofRequest.predicates[referent].filter((r) => !r.revoked);
        }
    }
    return credentialsForProofRequest;
};
exports.getCredentialsForAnonCredsProofRequest = getCredentialsForAnonCredsProofRequest;
//# sourceMappingURL=getCredentialsForAnonCredsRequest.js.map