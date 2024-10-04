import type { AgentContext } from '@credo-ts/core';
import { AgentContextProvider, AgentDependencies } from '@credo-ts/core';
import { EventEmitter as NativeEventEmitter } from 'events';
import { OpenId4VcVerificationSessionState } from '../OpenId4VcVerificationSessionState';
import { OpenId4VcVerificationSessionRecord } from './OpenId4VcVerificationSessionRecord';
export declare class OpenId4VcRelyingPartyEventHandler {
    private agentContextProvider;
    readonly nativeEventEmitter: NativeEventEmitter;
    constructor(agentContextProvider: AgentContextProvider, agentDependencies: AgentDependencies);
    getEventEmitterForVerifier(contextCorrelationId: string, verifierId: string): OpenId4VcRelyingPartyEventEmitter;
    private onAuthorizationRequestCreatedSuccess;
    private onAuthorizationRequestSentSuccess;
    private onAuthorizationResponseReceivedFailed;
    private onAuthorizationResponseVerifiedSuccess;
    private onAuthorizationResponseVerifiedFailed;
    private withSession;
    protected emitStateChangedEvent(agentContext: AgentContext, verificationSession: OpenId4VcVerificationSessionRecord, previousState: OpenId4VcVerificationSessionState | null): void;
}
/**
 * Custom implementation of the event emitter so we can associate the contextCorrelationId
 * and the verifierId with the events that are emitted. This allows us to only create one
 * event emitter and thus not have endless event emitters and listeners for each active RP.
 *
 * We only modify the emit method, and add the verifierId and contextCorrelationId to the event
 * this allows the listener to know which tenant and which verifier the event is associated with.
 */
declare class OpenId4VcRelyingPartyEventEmitter implements NativeEventEmitter {
    private nativeEventEmitter;
    private contextCorrelationId;
    private verifierId;
    constructor(nativeEventEmitter: NativeEventEmitter, contextCorrelationId: string, verifierId: string);
    emit(eventName: string | symbol, ...args: any[]): boolean;
    [NativeEventEmitter.captureRejectionSymbol]?(error: Error, event: string, ...args: any[]): void;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol | undefined): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    rawListeners(eventName: string | symbol): Function[];
    listenerCount(eventName: string | symbol, listener?: Function | undefined): number;
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): (string | symbol)[];
}
export {};
