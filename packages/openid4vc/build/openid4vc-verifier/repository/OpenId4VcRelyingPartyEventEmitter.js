"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcRelyingPartyEventHandler = void 0;
const core_1 = require("@credo-ts/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const events_1 = require("events");
const OpenId4VcVerificationSessionState_1 = require("../OpenId4VcVerificationSessionState");
const OpenId4VcVerifierEvents_1 = require("../OpenId4VcVerifierEvents");
const OpenId4VcVerificationSessionRecord_1 = require("./OpenId4VcVerificationSessionRecord");
const OpenId4VcVerificationSessionRepository_1 = require("./OpenId4VcVerificationSessionRepository");
let OpenId4VcRelyingPartyEventHandler = class OpenId4VcRelyingPartyEventHandler {
    constructor(agentContextProvider, agentDependencies) {
        this.agentContextProvider = agentContextProvider;
        this.onAuthorizationRequestCreatedSuccess = async (event, context) => {
            var _a, _b;
            const authorizationRequestJwt = await ((_a = event.subject) === null || _a === void 0 ? void 0 : _a.requestObjectJwt());
            if (!authorizationRequestJwt) {
                throw new core_1.CredoError('Authorization request object JWT is missing');
            }
            const authorizationRequestUri = (_b = event.subject) === null || _b === void 0 ? void 0 : _b.payload.request_uri;
            if (!authorizationRequestUri) {
                throw new core_1.CredoError('Authorization request URI is missing');
            }
            const verificationSession = new OpenId4VcVerificationSessionRecord_1.OpenId4VcVerificationSessionRecord({
                id: event.correlationId,
                authorizationRequestJwt,
                authorizationRequestUri,
                state: OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated,
                verifierId: context.verifierId,
            });
            await this.withSession(context.contextCorrelationId, async (agentContext, verificationSessionRepository) => {
                await verificationSessionRepository.save(agentContext, verificationSession);
                this.emitStateChangedEvent(agentContext, verificationSession, null);
            });
        };
        this.onAuthorizationRequestSentSuccess = async (event, context) => {
            await this.withSession(context.contextCorrelationId, async (agentContext, verificationSessionRepository) => {
                const verificationSession = await verificationSessionRepository.getById(agentContext, event.correlationId);
                // In all other cases it doesn't make sense to update the state, as the state is already advanced beyond
                // this state.
                if (verificationSession.state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated) {
                    verificationSession.state = OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved;
                    await verificationSessionRepository.update(agentContext, verificationSession);
                    this.emitStateChangedEvent(agentContext, verificationSession, OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated);
                }
            });
        };
        this.onAuthorizationResponseReceivedFailed = async (event, context) => {
            await this.withSession(context.contextCorrelationId, async (agentContext, verificationSessionRepository) => {
                var _a, _b;
                const verificationSession = await verificationSessionRepository.getById(agentContext, event.correlationId);
                const previousState = verificationSession.state;
                verificationSession.state = OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error;
                verificationSession.authorizationResponsePayload = (_a = event.subject) === null || _a === void 0 ? void 0 : _a.payload;
                verificationSession.errorMessage = (_b = event.error) === null || _b === void 0 ? void 0 : _b.message;
                await verificationSessionRepository.update(agentContext, verificationSession);
                this.emitStateChangedEvent(agentContext, verificationSession, previousState);
            });
        };
        this.onAuthorizationResponseVerifiedSuccess = async (event, context) => {
            await this.withSession(context.contextCorrelationId, async (agentContext, verificationSessionRepository) => {
                var _a;
                const verificationSession = await verificationSessionRepository.getById(agentContext, event.correlationId);
                if (verificationSession.state !== OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error &&
                    verificationSession.state !== OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified) {
                    const previousState = verificationSession.state;
                    verificationSession.authorizationResponsePayload = (_a = event.subject) === null || _a === void 0 ? void 0 : _a.payload;
                    verificationSession.state = OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified;
                    await verificationSessionRepository.update(agentContext, verificationSession);
                    this.emitStateChangedEvent(agentContext, verificationSession, previousState);
                }
            });
        };
        this.onAuthorizationResponseVerifiedFailed = async (event, context) => {
            await this.withSession(context.contextCorrelationId, async (agentContext, verificationSessionRepository) => {
                var _a;
                const verificationSession = await verificationSessionRepository.getById(agentContext, event.correlationId);
                const previousState = verificationSession.state;
                verificationSession.state = OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error;
                verificationSession.errorMessage = (_a = event.error) === null || _a === void 0 ? void 0 : _a.message;
                await verificationSessionRepository.update(agentContext, verificationSession);
                this.emitStateChangedEvent(agentContext, verificationSession, previousState);
            });
        };
        this.nativeEventEmitter = new agentDependencies.EventEmitterClass();
        this.nativeEventEmitter.on(did_auth_siop_1.AuthorizationEvents.ON_AUTH_REQUEST_CREATED_SUCCESS, this.onAuthorizationRequestCreatedSuccess);
        // We don't want to do anything currently when a request creation failed, as then the method that
        // is called to create it will throw and we won't create a session
        // AuthorizationEvents.ON_AUTH_REQUEST_CREATED_FAILED,
        this.nativeEventEmitter.on(did_auth_siop_1.AuthorizationEvents.ON_AUTH_REQUEST_SENT_SUCCESS, this.onAuthorizationRequestSentSuccess);
        // We manually call when the request is retrieved, and there's not really a case where it can fail, and
        // not really sure how to represent it in the verification session. So not doing anything here.
        // AuthorizationEvents.ON_AUTH_REQUEST_SENT_FAILED
        // NOTE: the response received and response verified states are fired in such rapid succession
        // that the verification session record is not updated yet to received before the verified event is
        // emitted. For now we only track the verified / failed event. Otherwise we need to use record locking, which we don't have in-place yet
        // AuthorizationEvents.ON_AUTH_RESPONSE_RECEIVED_SUCCESS,
        this.nativeEventEmitter.on(did_auth_siop_1.AuthorizationEvents.ON_AUTH_RESPONSE_RECEIVED_FAILED, this.onAuthorizationResponseReceivedFailed);
        this.nativeEventEmitter.on(did_auth_siop_1.AuthorizationEvents.ON_AUTH_RESPONSE_VERIFIED_SUCCESS, this.onAuthorizationResponseVerifiedSuccess);
        this.nativeEventEmitter.on(did_auth_siop_1.AuthorizationEvents.ON_AUTH_RESPONSE_VERIFIED_FAILED, this.onAuthorizationResponseVerifiedFailed);
    }
    getEventEmitterForVerifier(contextCorrelationId, verifierId) {
        return new OpenId4VcRelyingPartyEventEmitter(this.nativeEventEmitter, contextCorrelationId, verifierId);
    }
    async withSession(contextCorrelationId, callback) {
        const agentContext = await this.agentContextProvider.getAgentContextForContextCorrelationId(contextCorrelationId);
        try {
            const verificationSessionRepository = agentContext.dependencyManager.resolve(OpenId4VcVerificationSessionRepository_1.OpenId4VcVerificationSessionRepository);
            const result = await callback(agentContext, verificationSessionRepository);
            return result;
        }
        finally {
            await agentContext.endSession();
        }
    }
    emitStateChangedEvent(agentContext, verificationSession, previousState) {
        const eventEmitter = agentContext.dependencyManager.resolve(core_1.EventEmitter);
        eventEmitter.emit(agentContext, {
            type: OpenId4VcVerifierEvents_1.OpenId4VcVerifierEvents.VerificationSessionStateChanged,
            payload: {
                verificationSession: verificationSession.clone(),
                previousState,
            },
        });
    }
};
exports.OpenId4VcRelyingPartyEventHandler = OpenId4VcRelyingPartyEventHandler;
exports.OpenId4VcRelyingPartyEventHandler = OpenId4VcRelyingPartyEventHandler = __decorate([
    (0, core_1.injectable)(),
    __param(0, (0, core_1.inject)(core_1.InjectionSymbols.AgentContextProvider)),
    __param(1, (0, core_1.inject)(core_1.InjectionSymbols.AgentDependencies)),
    __metadata("design:paramtypes", [Object, Object])
], OpenId4VcRelyingPartyEventHandler);
/**
 * Custom implementation of the event emitter so we can associate the contextCorrelationId
 * and the verifierId with the events that are emitted. This allows us to only create one
 * event emitter and thus not have endless event emitters and listeners for each active RP.
 *
 * We only modify the emit method, and add the verifierId and contextCorrelationId to the event
 * this allows the listener to know which tenant and which verifier the event is associated with.
 */
class OpenId4VcRelyingPartyEventEmitter {
    constructor(nativeEventEmitter, contextCorrelationId, verifierId) {
        this.nativeEventEmitter = nativeEventEmitter;
        this.contextCorrelationId = contextCorrelationId;
        this.verifierId = verifierId;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit(eventName, ...args) {
        return this.nativeEventEmitter.emit(eventName, ...args, {
            contextCorrelationId: this.contextCorrelationId,
            verifierId: this.verifierId,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [events_1.EventEmitter.captureRejectionSymbol](error, event, ...args) {
        var _a, _b;
        return (_b = (_a = this.nativeEventEmitter)[events_1.EventEmitter.captureRejectionSymbol]) === null || _b === void 0 ? void 0 : _b.call(_a, error, event, ...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener(eventName, listener) {
        this.nativeEventEmitter.addListener(eventName, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(eventName, listener) {
        this.nativeEventEmitter.on(eventName, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(eventName, listener) {
        this.nativeEventEmitter.once(eventName, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener(eventName, listener) {
        this.nativeEventEmitter.removeListener(eventName, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(eventName, listener) {
        this.nativeEventEmitter.off(eventName, listener);
        return this;
    }
    removeAllListeners(event) {
        this.nativeEventEmitter.removeAllListeners(event);
        return this;
    }
    setMaxListeners(n) {
        this.nativeEventEmitter.setMaxListeners(n);
        return this;
    }
    getMaxListeners() {
        return this.nativeEventEmitter.getMaxListeners();
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    listeners(eventName) {
        return this.nativeEventEmitter.listeners(eventName);
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    rawListeners(eventName) {
        return this.nativeEventEmitter.rawListeners(eventName);
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    listenerCount(eventName, listener) {
        return this.nativeEventEmitter.listenerCount(eventName, listener);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prependListener(eventName, listener) {
        this.nativeEventEmitter.prependListener(eventName, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prependOnceListener(eventName, listener) {
        this.nativeEventEmitter.prependOnceListener(eventName, listener);
        return this;
    }
    eventNames() {
        return this.nativeEventEmitter.eventNames();
    }
}
//# sourceMappingURL=OpenId4VcRelyingPartyEventEmitter.js.map