import type { AnonCredsCredentialDefinition, AnonCredsRevocationStatusList, AnonCredsSchema } from '../models';
import type { AgentContext } from '@credo-ts/core';
export declare function fetchSchema(agentContext: AgentContext, schemaId: string): Promise<{
    schema: AnonCredsSchema;
    schemaId: string;
    indyNamespace: string | undefined;
}>;
export declare function fetchCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string): Promise<{
    credentialDefinition: AnonCredsCredentialDefinition;
    credentialDefinitionId: string;
    indyNamespace: string | undefined;
}>;
export declare function fetchRevocationRegistryDefinition(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<{
    revocationRegistryDefinition: import("../models").AnonCredsRevocationRegistryDefinition;
    revocationRegistryDefinitionId: string;
    indyNamespace: string | undefined;
}>;
export declare function fetchRevocationStatusList(agentContext: AgentContext, revocationRegistryId: string, timestamp: number): Promise<{
    revocationStatusList: AnonCredsRevocationStatusList;
}>;
export declare function fetchSchemas(agentContext: AgentContext, schemaIds: Set<string>): Promise<{
    [k: string]: AnonCredsSchema;
}>;
export declare function fetchCredentialDefinitions(agentContext: AgentContext, credentialDefinitionIds: Set<string>): Promise<{
    [k: string]: AnonCredsCredentialDefinition;
}>;
