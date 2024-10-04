import type { TenantRecord } from '../repository';
import type { MutexInterface } from 'async-mutex';
import { AgentContext, Logger } from '@credo-ts/core';
import { TenantsModuleConfig } from '../TenantsModuleConfig';
/**
 * Coordinates all agent context instance for tenant sessions.
 *
 * This class keeps a mapping of tenant ids (context correlation ids) to agent context sessions mapping. Each mapping contains the agent context,
 * the current session count and a mutex for making operations against the session mapping (opening / closing an agent context). The mutex ensures
 * we're not susceptible to race conditions where multiple calls to open/close an agent context are made at the same time. Even though JavaScript is
 * single threaded, promises can introduce race conditions as one process can stop and another process can be picked up.
 *
 * NOTE: the implementation doesn't yet cache agent context objects after they aren't being used for any sessions anymore. This means if a wallet is being used
 * often in a short time it will be opened/closed very often. This is an improvement to be made in the near future.
 */
export declare class TenantSessionCoordinator {
    private rootAgentContext;
    private logger;
    private tenantAgentContextMapping;
    private sessionMutex;
    private tenantsModuleConfig;
    constructor(rootAgentContext: AgentContext, logger: Logger, tenantsModuleConfig: TenantsModuleConfig);
    getSessionCountForTenant(tenantId: string): number;
    /**
     * Get agent context to use for a session. If an agent context for this tenant does not exist yet
     * it will create it and store it for later use. If the agent context does already exist it will
     * be returned.
     *
     * @parm tenantRecord The tenant record for which to get the agent context
     */
    getContextForSession(tenantRecord: TenantRecord, { runInMutex, }?: {
        /** optional callback that will be run inside the mutex lock */
        runInMutex?: (agentContext: AgentContext) => Promise<void>;
    }): Promise<AgentContext>;
    /**
     * End a session for the provided agent context. It will decrease the session count for the agent context.
     * If the number of sessions is zero after the context for this session has been ended, the agent context will be closed.
     */
    endAgentContextSession(agentContext: AgentContext): Promise<void>;
    private hasTenantSessionMapping;
    private getTenantSessionsMapping;
    private mutexForTenant;
    private createAgentContext;
    private closeAgentContext;
}
interface TenantContextSessions {
    sessionCount: number;
    agentContext?: AgentContext;
    mutex: MutexInterface;
}
export interface TenantAgentContextMapping {
    [tenantId: string]: TenantContextSessions | undefined;
}
export {};
