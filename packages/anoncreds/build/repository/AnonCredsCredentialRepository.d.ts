import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsCredentialRecord } from './AnonCredsCredentialRecord';
export declare class AnonCredsCredentialRepository extends Repository<AnonCredsCredentialRecord> {
    constructor(storageService: StorageService<AnonCredsCredentialRecord>, eventEmitter: EventEmitter);
    getByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialRecord>;
    findByCredentialDefinitionId(agentContext: AgentContext, credentialDefinitionId: string): Promise<AnonCredsCredentialRecord | null>;
    getByCredentialId(agentContext: AgentContext, credentialId: string): Promise<AnonCredsCredentialRecord>;
    findByCredentialId(agentContext: AgentContext, credentialId: string): Promise<AnonCredsCredentialRecord | null>;
}
