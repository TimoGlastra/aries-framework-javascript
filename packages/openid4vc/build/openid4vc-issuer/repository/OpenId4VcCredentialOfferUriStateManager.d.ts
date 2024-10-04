import type { AgentContext } from '@credo-ts/core';
import type { IStateManager, URIState } from '@sphereon/oid4vci-common';
export declare class OpenId4VcCredentialOfferUriStateManager implements IStateManager<URIState> {
    private agentContext;
    private issuerId;
    private openId4VcIssuanceSessionRepository;
    constructor(agentContext: AgentContext, issuerId: string);
    set(uri: string, stateValue: URIState): Promise<void>;
    get(uri: string): Promise<URIState | undefined>;
    has(uri: string): Promise<boolean>;
    delete(): Promise<boolean>;
    clearExpired(): Promise<void>;
    clearAll(): Promise<void>;
    getAsserted(id: string): Promise<URIState>;
    startCleanupRoutine(): Promise<void>;
    stopCleanupRoutine(): Promise<void>;
}
