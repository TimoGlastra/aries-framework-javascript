import type { AnonCredsSchema, AnonCredsRevocationStatusList, AnonCredsCredentialOffer } from '../models';
import type { AnonCredsIssuerService, CreateSchemaOptions, CreateCredentialDefinitionOptions, CreateCredentialDefinitionReturn, CreateRevocationRegistryDefinitionOptions, CreateRevocationRegistryDefinitionReturn, CreateRevocationStatusListOptions, UpdateRevocationStatusListOptions, CreateCredentialOptions, CreateCredentialReturn, CreateCredentialOfferOptions } from '../services';
import type { AgentContext } from '@credo-ts/core';
export declare class AnonCredsRsIssuerService implements AnonCredsIssuerService {
    createSchema(agentContext: AgentContext, options: CreateSchemaOptions): Promise<AnonCredsSchema>;
    createCredentialDefinition(agentContext: AgentContext, options: CreateCredentialDefinitionOptions): Promise<CreateCredentialDefinitionReturn>;
    createRevocationRegistryDefinition(agentContext: AgentContext, options: CreateRevocationRegistryDefinitionOptions): Promise<CreateRevocationRegistryDefinitionReturn>;
    createRevocationStatusList(agentContext: AgentContext, options: CreateRevocationStatusListOptions): Promise<AnonCredsRevocationStatusList>;
    updateRevocationStatusList(agentContext: AgentContext, options: UpdateRevocationStatusListOptions): Promise<AnonCredsRevocationStatusList>;
    createCredentialOffer(agentContext: AgentContext, options: CreateCredentialOfferOptions): Promise<AnonCredsCredentialOffer>;
    createCredential(agentContext: AgentContext, options: CreateCredentialOptions): Promise<CreateCredentialReturn>;
}
