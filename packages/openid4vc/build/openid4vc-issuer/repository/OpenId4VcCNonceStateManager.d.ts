import type { AgentContext } from '@credo-ts/core';
import type { CNonceState, IStateManager } from '@sphereon/oid4vci-common';
export declare class OpenId4VcCNonceStateManager implements IStateManager<CNonceState> {
    private agentContext;
    private issuerId;
    private openId4VcIssuanceSessionRepository;
    private openId4VcIssuerModuleConfig;
    constructor(agentContext: AgentContext, issuerId: string);
    set(cNonce: string, stateValue: CNonceState): Promise<void>;
    get(cNonce: string): Promise<CNonceState | undefined>;
    has(cNonce: string): Promise<boolean>;
    delete(cNonce: string): Promise<boolean>;
    clearExpired(): Promise<void>;
    clearAll(): Promise<void>;
    getAsserted(id: string): Promise<CNonceState>;
    startCleanupRoutine(): Promise<void>;
    stopCleanupRoutine(): Promise<void>;
}
