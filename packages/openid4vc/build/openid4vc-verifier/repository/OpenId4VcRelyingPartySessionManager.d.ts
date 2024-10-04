import type { AgentContext } from '@credo-ts/core';
import type { AuthorizationRequestState, AuthorizationResponseState, IRPSessionManager } from '@sphereon/did-auth-siop';
export declare class OpenId4VcRelyingPartySessionManager implements IRPSessionManager {
    private agentContext;
    private verifierId;
    private openId4VcVerificationSessionRepository;
    constructor(agentContext: AgentContext, verifierId: string);
    getRequestStateByCorrelationId(correlationId: string, errorOnNotFound?: boolean): Promise<AuthorizationRequestState | undefined>;
    getRequestStateByNonce(nonce: string, errorOnNotFound?: boolean): Promise<AuthorizationRequestState | undefined>;
    getRequestStateByState(state: string, errorOnNotFound?: boolean): Promise<AuthorizationRequestState | undefined>;
    getResponseStateByCorrelationId(correlationId: string, errorOnNotFound?: boolean): Promise<AuthorizationResponseState | undefined>;
    getResponseStateByNonce(nonce: string, errorOnNotFound?: boolean): Promise<AuthorizationResponseState | undefined>;
    getResponseStateByState(state: string, errorOnNotFound?: boolean): Promise<AuthorizationResponseState | undefined>;
    getCorrelationIdByNonce(nonce: string, errorOnNotFound?: boolean): Promise<string | undefined>;
    getCorrelationIdByState(state: string, errorOnNotFound?: boolean): Promise<string | undefined>;
    deleteStateForCorrelationId(): Promise<void>;
    private getRequestStateFromSessionRecord;
    private getResponseStateFromSessionRecord;
}
