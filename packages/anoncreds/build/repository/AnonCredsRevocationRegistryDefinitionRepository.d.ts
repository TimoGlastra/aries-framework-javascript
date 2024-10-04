import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsRevocationRegistryDefinitionRecord } from './AnonCredsRevocationRegistryDefinitionRecord';
export declare class AnonCredsRevocationRegistryDefinitionRepository extends Repository<AnonCredsRevocationRegistryDefinitionRecord> {
    constructor(storageService: StorageService<AnonCredsRevocationRegistryDefinitionRecord>, eventEmitter: EventEmitter);
    getByRevocationRegistryDefinitionId(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<AnonCredsRevocationRegistryDefinitionRecord>;
    findByRevocationRegistryDefinitionId(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<AnonCredsRevocationRegistryDefinitionRecord | null>;
    findAllByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsRevocationRegistryDefinitionRecord[]>;
}
