"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOfferedCredentials = getOfferedCredentials;
exports.getScopesFromCredentialConfigurationsSupported = getScopesFromCredentialConfigurationsSupported;
exports.getAllowedAndRequestedScopeValues = getAllowedAndRequestedScopeValues;
exports.getCredentialConfigurationsSupportedForScopes = getCredentialConfigurationsSupportedForScopes;
/**
 * Returns all entries from the credential offer with the associated metadata resolved.
 */
function getOfferedCredentials(offeredCredentialConfigurationIds, credentialConfigurationsSupported, { ignoreNotFoundIds = false } = {}) {
    const offeredCredentialConfigurations = {};
    for (const offeredCredentialConfigurationId of offeredCredentialConfigurationIds) {
        const foundCredentialConfiguration = credentialConfigurationsSupported[offeredCredentialConfigurationId];
        // Make sure the issuer metadata includes the offered credential.
        if (!foundCredentialConfiguration) {
            if (!ignoreNotFoundIds) {
                throw new Error(`Offered credential configuration id '${offeredCredentialConfigurationId}' is not part of credential_configurations_supported of the issuer metadata.`);
            }
            continue;
        }
        offeredCredentialConfigurations[offeredCredentialConfigurationId] = foundCredentialConfiguration;
    }
    return offeredCredentialConfigurations;
}
function getScopesFromCredentialConfigurationsSupported(credentialConfigurationsSupported) {
    return Array.from(new Set(Object.values(credentialConfigurationsSupported)
        .map((configuration) => configuration.scope)
        .filter((scope) => scope !== undefined)));
}
function getAllowedAndRequestedScopeValues(options) {
    const requestedScopeValues = options.requestedScope.split(' ');
    const allowedAndRequestedScopeValues = options.allowedScopes.filter((allowedScope) => requestedScopeValues.includes(allowedScope));
    return allowedAndRequestedScopeValues;
}
function getCredentialConfigurationsSupportedForScopes(credentialConfigurationsSupported, scopes) {
    return Object.fromEntries(Object.entries(credentialConfigurationsSupported).filter(([, configuration]) => configuration.scope && scopes.includes(configuration.scope)));
}
//# sourceMappingURL=issuerMetadataUtils.js.map