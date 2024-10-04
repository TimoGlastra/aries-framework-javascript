import type { AgentContext } from '@credo-ts/core';
import type { CredentialOfferSession, IStateManager } from '@sphereon/oid4vci-common';
import { OpenId4VcIssuanceSessionState } from '../OpenId4VcIssuanceSessionState';
import { OpenId4VcIssuanceSessionRecord } from './OpenId4VcIssuanceSessionRecord';
export declare class OpenId4VcCredentialOfferSessionStateManager implements IStateManager<CredentialOfferSession> {
    private agentContext;
    private issuerId;
    private openId4VcIssuanceSessionRepository;
    private eventEmitter;
    constructor(agentContext: AgentContext, issuerId: string);
    set(preAuthorizedCode: string, stateValue: CredentialOfferSession): Promise<void>;
    get(preAuthorizedCode: string): Promise<CredentialOfferSession | undefined>;
    has(preAuthorizedCode: string): Promise<boolean>;
    delete(preAuthorizedCode: string): Promise<boolean>;
    clearExpired(): Promise<void>;
    clearAll(): Promise<void>;
    getAsserted(preAuthorizedCode: string): Promise<CredentialOfferSession>;
    startCleanupRoutine(): Promise<void>;
    stopCleanupRoutine(): Promise<void>;
    protected emitStateChangedEvent(agentContext: AgentContext, issuanceSession: OpenId4VcIssuanceSessionRecord, previousState: OpenId4VcIssuanceSessionState | null): void;
}
