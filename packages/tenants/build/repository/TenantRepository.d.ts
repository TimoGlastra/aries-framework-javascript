import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { TenantRecord } from './TenantRecord';
export declare class TenantRepository extends Repository<TenantRecord> {
    constructor(storageService: StorageService<TenantRecord>, eventEmitter: EventEmitter);
    findByLabel(agentContext: AgentContext, label: string): Promise<TenantRecord[]>;
}
