import type { AnonCredsProof, AnonCredsProofRequest } from '../models/exchange';
import type { AnonCredsRevocationStatusList, AnonCredsRevocationRegistryDefinition } from '../models/registry';
import type { AnonCredsSchemas, AnonCredsCredentialDefinitions, CredentialWithRevocationMetadata } from '../models/utils';
import type { W3cJsonLdVerifiablePresentation } from '@credo-ts/core';
export interface VerifyProofOptions {
    proofRequest: AnonCredsProofRequest;
    proof: AnonCredsProof;
    schemas: AnonCredsSchemas;
    credentialDefinitions: AnonCredsCredentialDefinitions;
    revocationRegistries: {
        [revocationRegistryDefinitionId: string]: {
            definition: AnonCredsRevocationRegistryDefinition;
            revocationStatusLists: {
                [timestamp: number]: AnonCredsRevocationStatusList;
            };
        };
    };
}
export interface VerifyW3cPresentationOptions {
    proofRequest: AnonCredsProofRequest;
    presentation: W3cJsonLdVerifiablePresentation;
    schemas: AnonCredsSchemas;
    credentialDefinitions: AnonCredsCredentialDefinitions;
    credentialsWithRevocationMetadata: CredentialWithRevocationMetadata[];
}
