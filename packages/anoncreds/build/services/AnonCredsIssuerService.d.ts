import type { CreateSchemaOptions, CreateCredentialDefinitionOptions, CreateCredentialOfferOptions, CreateCredentialReturn, CreateCredentialOptions, CreateCredentialDefinitionReturn, CreateRevocationRegistryDefinitionOptions, CreateRevocationRegistryDefinitionReturn, CreateRevocationStatusListOptions, UpdateRevocationStatusListOptions } from './AnonCredsIssuerServiceOptions';
import type { AnonCredsCredentialOffer } from '../models/exchange';
import type { AnonCredsRevocationStatusList, AnonCredsSchema } from '../models/registry';
import type { AgentContext } from '@credo-ts/core';
export declare const AnonCredsIssuerServiceSymbol: unique symbol;
export interface AnonCredsIssuerService {
    createSchema(agentContext: AgentContext, options: CreateSchemaOptions): Promise<AnonCredsSchema>;
    createCredentialDefinition(agentContext: AgentContext, options: CreateCredentialDefinitionOptions, metadata?: Record<string, unknown>): Promise<CreateCredentialDefinitionReturn>;
    createRevocationRegistryDefinition(agentContext: AgentContext, options: CreateRevocationRegistryDefinitionOptions): Promise<CreateRevocationRegistryDefinitionReturn>;
    createRevocationStatusList(agentContext: AgentContext, options: CreateRevocationStatusListOptions): Promise<AnonCredsRevocationStatusList>;
    updateRevocationStatusList(agentContext: AgentContext, options: UpdateRevocationStatusListOptions): Promise<AnonCredsRevocationStatusList>;
    createCredentialOffer(agentContext: AgentContext, options: CreateCredentialOfferOptions): Promise<AnonCredsCredentialOffer>;
    createCredential(agentContext: AgentContext, options: CreateCredentialOptions): Promise<CreateCredentialReturn>;
}
