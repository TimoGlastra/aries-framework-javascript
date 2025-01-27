import type { AnonCredsRegistry, GetCredentialDefinitionReturn, GetRevocationStatusListReturn, GetRevocationRegistryDefinitionReturn, GetSchemaReturn, RegisterCredentialDefinitionOptions, RegisterCredentialDefinitionReturn, RegisterSchemaReturn, RegisterSchemaOptions, RegisterRevocationRegistryDefinitionReturn, RegisterRevocationStatusListReturn, RegisterRevocationRegistryDefinitionOptions, RegisterRevocationStatusListOptions } from '@credo-ts/anoncreds';
import type { AgentContext } from '@credo-ts/core';
export declare class CheqdAnonCredsRegistry implements AnonCredsRegistry {
    methodName: string;
    /**
     * This class supports resolving and registering objects with cheqd identifiers.
     * It needs to include support for the schema, credential definition, revocation registry as well
     * as the issuer id (which is needed when registering objects).
     */
    readonly supportedIdentifier: RegExp;
    getSchema(agentContext: AgentContext, schemaId: string): Promise<GetSchemaReturn>;
    registerSchema(agentContext: AgentContext, options: RegisterSchemaOptions): Promise<RegisterSchemaReturn>;
    registerCredentialDefinition(agentContext: AgentContext, options: RegisterCredentialDefinitionOptions): Promise<RegisterCredentialDefinitionReturn>;
    getCredentialDefinition(agentContext: AgentContext, credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn>;
    getRevocationRegistryDefinition(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<GetRevocationRegistryDefinitionReturn>;
    registerRevocationRegistryDefinition(agentContext: AgentContext, { revocationRegistryDefinition, options }: RegisterRevocationRegistryDefinitionOptions): Promise<RegisterRevocationRegistryDefinitionReturn>;
    getRevocationStatusList(agentContext: AgentContext, revocationRegistryId: string, timestamp: number): Promise<GetRevocationStatusListReturn>;
    registerRevocationStatusList(agentContext: AgentContext, { revocationStatusList, options }: RegisterRevocationStatusListOptions): Promise<RegisterRevocationStatusListReturn>;
}
