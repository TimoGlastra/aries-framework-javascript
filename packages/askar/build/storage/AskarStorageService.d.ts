import type { BaseRecordConstructor, AgentContext, BaseRecord, Query, QueryOptions, StorageService } from '@credo-ts/core';
export declare class AskarStorageService<T extends BaseRecord> implements StorageService<T> {
    /** @inheritDoc */
    save(agentContext: AgentContext, record: T): Promise<void>;
    /** @inheritDoc */
    update(agentContext: AgentContext, record: T): Promise<void>;
    /** @inheritDoc */
    delete(agentContext: AgentContext, record: T): Promise<void>;
    /** @inheritDoc */
    deleteById(agentContext: AgentContext, recordClass: BaseRecordConstructor<T>, id: string): Promise<void>;
    /** @inheritDoc */
    getById(agentContext: AgentContext, recordClass: BaseRecordConstructor<T>, id: string): Promise<T>;
    /** @inheritDoc */
    getAll(agentContext: AgentContext, recordClass: BaseRecordConstructor<T>): Promise<T[]>;
    /** @inheritDoc */
    findByQuery(agentContext: AgentContext, recordClass: BaseRecordConstructor<T>, query: Query<T>, queryOptions?: QueryOptions): Promise<T[]>;
}
