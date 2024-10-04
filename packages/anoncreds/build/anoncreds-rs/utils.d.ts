import type { AnonCredsNonRevokedInterval } from '../models';
import type { AgentContext, W3cJsonLdVerifiableCredential } from '@credo-ts/core';
import type { NonRevokedIntervalOverride } from '@hyperledger/anoncreds-shared';
import { RevocationRegistryDefinition, RevocationStatusList, CredentialRevocationState } from '@hyperledger/anoncreds-shared';
export interface CredentialRevocationMetadata {
    timestamp?: number;
    revocationRegistryId: string;
    revocationRegistryIndex?: number;
    nonRevokedInterval: AnonCredsNonRevokedInterval;
}
export declare function getRevocationMetadata(agentContext: AgentContext, credentialRevocationMetadata: CredentialRevocationMetadata, mustHaveTimeStamp?: boolean): Promise<{
    updatedTimestamp: number;
    revocationRegistryId: string;
    revocationRegistryDefinition: RevocationRegistryDefinition;
    revocationStatusList: RevocationStatusList;
    nonRevokedIntervalOverride: NonRevokedIntervalOverride | undefined;
    revocationState: CredentialRevocationState | undefined;
}>;
export declare const getW3cAnonCredsCredentialMetadata: (w3cJsonLdVerifiableCredential: W3cJsonLdVerifiableCredential) => {
    schemaId: string;
    credentialDefinitionId: string;
    revocationRegistryId: string;
};
