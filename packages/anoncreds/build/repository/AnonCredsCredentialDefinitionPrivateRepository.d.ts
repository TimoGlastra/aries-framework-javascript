import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsCredentialDefinitionPrivateRecord } from './AnonCredsCredentialDefinitionPrivateRecord';
export declare class AnonCredsCredentialDefinitionPrivateRepository extends Repository<AnonCredsCredentialDefinitionPrivateRecord> {
    constructor(storageService: StorageService<AnonCredsCredentialDefinitionPrivateRecord>, eventEmitter: EventEmitter);
    getByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialDefinitionPrivateRecord>;
    findByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialDefinitionPrivateRecord | null>;
}
