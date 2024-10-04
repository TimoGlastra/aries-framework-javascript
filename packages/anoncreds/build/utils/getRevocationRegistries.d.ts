import type { AnonCredsProof, AnonCredsProofRequest, AnonCredsSelectedCredentials } from '../models';
import type { AgentContext } from '@credo-ts/core';
export declare function getRevocationRegistriesForRequest(agentContext: AgentContext, proofRequest: AnonCredsProofRequest, selectedCredentials: AnonCredsSelectedCredentials): Promise<{
    revocationRegistries: import("../models/utils").AnonCredsRevocationRegistries;
    updatedSelectedCredentials: AnonCredsSelectedCredentials;
}>;
export declare function getRevocationRegistriesForProof(agentContext: AgentContext, proof: AnonCredsProof): Promise<{
    [revocationRegistryDefinitionId: string]: {
        definition: import("../models").AnonCredsRevocationRegistryDefinition;
        revocationStatusLists: {
            [timestamp: number]: import("../models").AnonCredsRevocationStatusList;
        };
    };
}>;
