"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateLinkSecretToV0_4 = migrateLinkSecretToV0_4;
const repository_1 = require("../../repository");
/**
 * Creates an {@link AnonCredsLinkSecretRecord} based on the wallet id. If an {@link AnonCredsLinkSecretRecord}
 * already exists (which is the case when upgraded to Askar), no link secret record will be created.
 */
async function migrateLinkSecretToV0_4(agent) {
    var _a, _b;
    agent.config.logger.info('Migrating link secret to storage version 0.4');
    const linkSecretRepository = agent.dependencyManager.resolve(repository_1.AnonCredsLinkSecretRepository);
    agent.config.logger.debug(`Fetching default link secret record from storage`);
    const defaultLinkSecret = await linkSecretRepository.findDefault(agent.context);
    if (!defaultLinkSecret) {
        // If no default link secret record exists, we create one based on the wallet id and set is as default
        agent.config.logger.debug(`No default link secret record found. Creating one based on wallet id.`);
        if (!((_a = agent.wallet.walletConfig) === null || _a === void 0 ? void 0 : _a.id)) {
            agent.config.logger.error(`Wallet id not found. Cannot create default link secret record. Skipping...`);
            return;
        }
        // We can't store the link secret value. This is not exposed by indy-sdk.
        const linkSecret = new repository_1.AnonCredsLinkSecretRecord({
            linkSecretId: (_b = agent.wallet.walletConfig) === null || _b === void 0 ? void 0 : _b.id,
        });
        linkSecret.setTag('isDefault', true);
        agent.config.logger.debug(`Saving default link secret record with record id ${linkSecret.id} and link secret id ${linkSecret.linkSecretId} to storage`);
        await linkSecretRepository.save(agent.context, linkSecret);
    }
    else {
        agent.config.logger.debug(`Default link secret record with record id ${defaultLinkSecret.id} and link secret id ${defaultLinkSecret.linkSecretId} found. Skipping...`);
    }
    agent.config.logger.debug(`Successfully migrated link secret to version 0.4`);
}
//# sourceMappingURL=linkSecret.js.map