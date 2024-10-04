import type { TenantRecord } from '../repository';
import type { AgentContextProvider, UpdateAssistantUpdateOptions } from '@credo-ts/core';
import { AgentContext, EventEmitter, Logger } from '@credo-ts/core';
import { TenantRecordService } from '../services';
import { TenantSessionCoordinator } from './TenantSessionCoordinator';
export declare class TenantAgentContextProvider implements AgentContextProvider {
    private tenantRecordService;
    private rootAgentContext;
    private eventEmitter;
    private logger;
    private tenantSessionCoordinator;
    constructor(tenantRecordService: TenantRecordService, rootAgentContext: AgentContext, eventEmitter: EventEmitter, tenantSessionCoordinator: TenantSessionCoordinator, logger: Logger);
    getAgentContextForContextCorrelationId(contextCorrelationId: string): Promise<AgentContext>;
    getContextForInboundMessage(inboundMessage: unknown, options?: {
        contextCorrelationId?: string;
    }): Promise<AgentContext>;
    endSessionForAgentContext(agentContext: AgentContext): Promise<void>;
    private getRecipientKeysFromEncryptedMessage;
    private registerRecipientKeyForTenant;
    private listenForRoutingKeyCreatedEvents;
    /**
     * Method to allow updating the tenant storage, this method can be called from the TenantsApi
     * to update the storage for a tenant manually
     */
    updateTenantStorage(tenantRecord: TenantRecord, updateOptions?: UpdateAssistantUpdateOptions): Promise<void>;
    /**
     * Handle the case where the tenant storage is outdated. If auto-update is disabled we will throw an error
     * and not update the storage. If auto-update is enabled we will update the storage.
     *
     * When this method is called we can be sure that we are in the mutex runExclusive lock and thus other sessions
     * will not be able to open a session for this tenant until we're done.
     *
     * NOTE: We don't support multi-instance locking for now. That means you can only have a single instance open and
     * it will prevent multiple processes from updating the tenant storage at the same time. However if multi-instances
     * are used, we can't prevent multiple instances from updating the tenant storage at the same time.
     * In the future we can make the tenantSessionCoordinator an interface and allowing a instance-tenant-lock as well
     * as an tenant-lock (across all instances)
     */
    private _updateTenantStorage;
}
