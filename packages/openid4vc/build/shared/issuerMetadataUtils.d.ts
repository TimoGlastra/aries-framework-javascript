import type { OpenId4VciCredentialConfigurationsSupported, OpenId4VciCredentialConfigurationSupported, OpenId4VciCredentialSupported, OpenId4VciCredentialSupportedWithId } from './models';
import type { AgentContext } from '@credo-ts/core';
import type { CredentialOfferFormatV1_0_11 } from '@sphereon/oid4vci-common';
/**
 * Get all `types` from a `CredentialSupported` object.
 *
 * Depending on the format, the types may be nested, or have different a different name/type
 */
export declare function getTypesFromCredentialSupported(credentialSupported: OpenId4VciCredentialConfigurationSupported): string[] | undefined;
export declare function credentialConfigurationSupportedToCredentialSupported(id: string, config: OpenId4VciCredentialConfigurationSupported): OpenId4VciCredentialSupportedWithId;
export declare function credentialSupportedToCredentialConfigurationSupported(agentContext: AgentContext, credentialSupported: OpenId4VciCredentialSupportedWithId): OpenId4VciCredentialConfigurationSupported;
export declare function credentialsSupportedV13ToV11(credentialConfigurationSupported: OpenId4VciCredentialConfigurationsSupported): OpenId4VciCredentialSupportedWithId[];
export declare function credentialsSupportedV11ToV13(agentContext: AgentContext, credentialsSupported: OpenId4VciCredentialSupportedWithId[]): OpenId4VciCredentialConfigurationsSupported;
/**
 * Returns all entries from the credential offer with the associated metadata resolved. For 'id' entries, the associated `credentials_supported` object is resolved from the issuer metadata.
 * For inline entries, an error is thrown.
 */
export declare function getOfferedCredentials(agentContext: AgentContext, offeredCredentials: Array<string | CredentialOfferFormatV1_0_11>, credentialsSupportedOrConfigurations: OpenId4VciCredentialConfigurationsSupported | OpenId4VciCredentialSupported[]): {
    credentialsSupported: OpenId4VciCredentialSupportedWithId[];
    credentialConfigurationsSupported: OpenId4VciCredentialConfigurationsSupported;
};
