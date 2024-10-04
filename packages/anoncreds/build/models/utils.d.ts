import type { AnonCredsNonRevokedInterval } from './exchange';
import type { AnonCredsSchema, AnonCredsCredentialDefinition, AnonCredsRevocationRegistryDefinition, AnonCredsRevocationStatusList } from './registry';
import type { W3cJsonLdVerifiableCredential } from '@credo-ts/core';
export interface AnonCredsSchemas {
    [schemaId: string]: AnonCredsSchema;
}
export interface AnonCredsCredentialDefinitions {
    [credentialDefinitionId: string]: AnonCredsCredentialDefinition;
}
export interface AnonCredsRevocationRegistries {
    [revocationRegistryDefinitionId: string]: {
        tailsFilePath: string;
        definition: AnonCredsRevocationRegistryDefinition;
        revocationStatusLists: {
            [timestamp: number]: AnonCredsRevocationStatusList;
        };
    };
}
export interface CredentialWithRevocationMetadata {
    credential: W3cJsonLdVerifiableCredential;
    nonRevoked?: AnonCredsNonRevokedInterval;
}
