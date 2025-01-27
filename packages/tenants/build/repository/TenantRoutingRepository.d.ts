import type { AgentContext, Key } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { TenantRoutingRecord } from './TenantRoutingRecord';
export declare class TenantRoutingRepository extends Repository<TenantRoutingRecord> {
    constructor(storageService: StorageService<TenantRoutingRecord>, eventEmitter: EventEmitter);
    findByRecipientKey(agentContext: AgentContext, key: Key): Promise<TenantRoutingRecord | null>;
}
