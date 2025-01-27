import type { TenantConfig } from '../models/TenantConfig';
import type { AgentContext, Key, Query, QueryOptions } from '@credo-ts/core';
import { TenantRepository, TenantRecord, TenantRoutingRepository, TenantRoutingRecord } from '../repository';
export declare class TenantRecordService {
    private tenantRepository;
    private tenantRoutingRepository;
    constructor(tenantRepository: TenantRepository, tenantRoutingRepository: TenantRoutingRepository);
    createTenant(agentContext: AgentContext, config: Omit<TenantConfig, 'walletConfig'>): Promise<TenantRecord>;
    getTenantById(agentContext: AgentContext, tenantId: string): Promise<TenantRecord>;
    findTenantsByLabel(agentContext: AgentContext, label: string): Promise<TenantRecord[]>;
    getAllTenants(agentContext: AgentContext): Promise<TenantRecord[]>;
    deleteTenantById(agentContext: AgentContext, tenantId: string): Promise<void>;
    updateTenant(agentContext: AgentContext, tenantRecord: TenantRecord): Promise<void>;
    findTenantsByQuery(agentContext: AgentContext, query: Query<TenantRecord>, queryOptions?: QueryOptions): Promise<TenantRecord[]>;
    findTenantRoutingRecordByRecipientKey(agentContext: AgentContext, recipientKey: Key): Promise<TenantRoutingRecord | null>;
    addTenantRoutingRecord(agentContext: AgentContext, tenantId: string, recipientKey: Key): Promise<TenantRoutingRecord>;
}
