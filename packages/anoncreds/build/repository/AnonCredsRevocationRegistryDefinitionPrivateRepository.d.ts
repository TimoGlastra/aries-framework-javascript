import type { AnonCredsRevocationRegistryState } from './AnonCredsRevocationRegistryDefinitionPrivateRecord';
import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsRevocationRegistryDefinitionPrivateRecord } from './AnonCredsRevocationRegistryDefinitionPrivateRecord';
export declare class AnonCredsRevocationRegistryDefinitionPrivateRepository extends Repository<AnonCredsRevocationRegistryDefinitionPrivateRecord> {
    constructor(storageService: StorageService<AnonCredsRevocationRegistryDefinitionPrivateRecord>, eventEmitter: EventEmitter);
    getByRevocationRegistryDefinitionId(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<AnonCredsRevocationRegistryDefinitionPrivateRecord>;
    findByRevocationRegistryDefinitionId(agentContext: AgentContext, revocationRegistryDefinitionId: string): Promise<AnonCredsRevocationRegistryDefinitionPrivateRecord | null>;
    findAllByCredentialDefinitionIdAndState(agentContext: AgentContext, credentialDefinitionId: string, state?: AnonCredsRevocationRegistryState): Promise<AnonCredsRevocationRegistryDefinitionPrivateRecord[]>;
}
