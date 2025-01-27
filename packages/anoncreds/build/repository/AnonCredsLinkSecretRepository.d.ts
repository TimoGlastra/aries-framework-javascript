import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { AnonCredsLinkSecretRecord } from './AnonCredsLinkSecretRecord';
export declare class AnonCredsLinkSecretRepository extends Repository<AnonCredsLinkSecretRecord> {
    constructor(storageService: StorageService<AnonCredsLinkSecretRecord>, eventEmitter: EventEmitter);
    getDefault(agentContext: AgentContext): Promise<AnonCredsLinkSecretRecord>;
    findDefault(agentContext: AgentContext): Promise<AnonCredsLinkSecretRecord | null>;
    getByLinkSecretId(agentContext: AgentContext, linkSecretId: string): Promise<AnonCredsLinkSecretRecord>;
    findByLinkSecretId(agentContext: AgentContext, linkSecretId: string): Promise<AnonCredsLinkSecretRecord | null>;
}
