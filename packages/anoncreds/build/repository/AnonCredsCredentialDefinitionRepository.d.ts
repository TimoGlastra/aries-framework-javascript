import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsCredentialDefinitionRecord } from './AnonCredsCredentialDefinitionRecord';
export declare class AnonCredsCredentialDefinitionRepository extends Repository<AnonCredsCredentialDefinitionRecord> {
    constructor(storageService: StorageService<AnonCredsCredentialDefinitionRecord>, eventEmitter: EventEmitter);
    getByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialDefinitionRecord>;
    findByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialDefinitionRecord | null>;
}
