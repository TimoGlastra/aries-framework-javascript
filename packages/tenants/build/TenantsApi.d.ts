import type { CreateTenantOptions, GetTenantAgentOptions, UpdateTenantStorageOptions, WithTenantAgentCallback } from './TenantsApiOptions';
import type { TenantRecord } from './repository';
import type { DefaultAgentModules, ModulesMap, Query, QueryOptions } from '@credo-ts/core';
import { AgentContext, Logger } from '@credo-ts/core';
import { TenantAgent } from './TenantAgent';
import { TenantAgentContextProvider } from './context/TenantAgentContextProvider';
import { TenantRecordService } from './services';
export declare class TenantsApi<AgentModules extends ModulesMap = DefaultAgentModules> {
    readonly rootAgentContext: AgentContext;
    private tenantRecordService;
    private agentContextProvider;
    private logger;
    constructor(tenantRecordService: TenantRecordService, rootAgentContext: AgentContext, agentContextProvider: TenantAgentContextProvider, logger: Logger);
    getTenantAgent({ tenantId }: GetTenantAgentOptions): Promise<TenantAgent<AgentModules>>;
    withTenantAgent<ReturnValue>(options: GetTenantAgentOptions, withTenantAgentCallback: WithTenantAgentCallback<AgentModules, ReturnValue>): Promise<ReturnValue>;
    createTenant(options: CreateTenantOptions): Promise<TenantRecord>;
    getTenantById(tenantId: string): Promise<TenantRecord>;
    findTenantsByLabel(label: string): Promise<TenantRecord[]>;
    deleteTenantById(tenantId: string): Promise<void>;
    updateTenant(tenant: TenantRecord): Promise<void>;
    findTenantsByQuery(query: Query<TenantRecord>, queryOptions?: QueryOptions): Promise<TenantRecord[]>;
    getAllTenants(): Promise<TenantRecord[]>;
    updateTenantStorage({ tenantId, updateOptions }: UpdateTenantStorageOptions): Promise<void>;
    getTenantsWithOutdatedStorage(): Promise<TenantRecord[]>;
}
