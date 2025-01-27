"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeLinkSecret = storeLinkSecret;
exports.assertLinkSecretsMatch = assertLinkSecretsMatch;
exports.getLinkSecret = getLinkSecret;
const AnonCredsRsError_1 = require("../error/AnonCredsRsError");
const repository_1 = require("../repository");
async function storeLinkSecret(agentContext, options) {
    const { linkSecretId, linkSecretValue, setAsDefault } = options;
    const linkSecretRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsLinkSecretRepository);
    // In some cases we don't have the linkSecretValue. However we still want a record so we know which link secret ids are valid
    const linkSecretRecord = new repository_1.AnonCredsLinkSecretRecord({ linkSecretId, value: linkSecretValue });
    // If it is the first link secret registered, set as default
    const defaultLinkSecretRecord = await linkSecretRepository.findDefault(agentContext);
    if (!defaultLinkSecretRecord || setAsDefault) {
        linkSecretRecord.setTag('isDefault', true);
    }
    // Set the current default link secret as not default
    if (defaultLinkSecretRecord && setAsDefault) {
        defaultLinkSecretRecord.setTag('isDefault', false);
        await linkSecretRepository.update(agentContext, defaultLinkSecretRecord);
    }
    await linkSecretRepository.save(agentContext, linkSecretRecord);
    return linkSecretRecord;
}
function assertLinkSecretsMatch(agentContext, linkSecretIds) {
    // Get all requested credentials and take linkSecret. If it's not the same for every credential, throw error
    const linkSecretsMatch = linkSecretIds.every((linkSecretId) => linkSecretId === linkSecretIds[0]);
    if (!linkSecretsMatch) {
        throw new AnonCredsRsError_1.AnonCredsRsError('All credentials in a Proof should have been issued using the same Link Secret');
    }
    return linkSecretIds[0];
}
async function getLinkSecret(agentContext, linkSecretId) {
    const linkSecretRecord = await agentContext.dependencyManager
        .resolve(repository_1.AnonCredsLinkSecretRepository)
        .getByLinkSecretId(agentContext, linkSecretId);
    if (!linkSecretRecord.value) {
        throw new AnonCredsRsError_1.AnonCredsRsError('Link Secret value not stored');
    }
    return linkSecretRecord.value;
}
//# sourceMappingURL=linkSecret.js.map