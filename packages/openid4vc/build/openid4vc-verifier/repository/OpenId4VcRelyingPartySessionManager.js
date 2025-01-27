"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcRelyingPartySessionManager = void 0;
const core_1 = require("@credo-ts/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const OpenId4VcVerificationSessionState_1 = require("../OpenId4VcVerificationSessionState");
const OpenId4VcVerificationSessionRepository_1 = require("./OpenId4VcVerificationSessionRepository");
class OpenId4VcRelyingPartySessionManager {
    constructor(agentContext, verifierId) {
        this.agentContext = agentContext;
        this.verifierId = verifierId;
        this.openId4VcVerificationSessionRepository = agentContext.dependencyManager.resolve(OpenId4VcVerificationSessionRepository_1.OpenId4VcVerificationSessionRepository);
    }
    async getRequestStateByCorrelationId(correlationId, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findById(this.agentContext, correlationId);
        if (!verificationSession) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization request state for correlation id ${correlationId} not found`);
            return undefined;
        }
        return this.getRequestStateFromSessionRecord(verificationSession);
    }
    async getRequestStateByNonce(nonce, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findSingleByQuery(this.agentContext, {
            verifierId: this.verifierId,
            nonce: nonce,
        });
        if (!verificationSession) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization request state for nonce ${nonce} not found`);
            return undefined;
        }
        return this.getRequestStateFromSessionRecord(verificationSession);
    }
    async getRequestStateByState(state, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findSingleByQuery(this.agentContext, {
            verifierId: this.verifierId,
            payloadState: state,
        });
        if (!verificationSession) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization request state for state ${state} not found`);
            return undefined;
        }
        return this.getRequestStateFromSessionRecord(verificationSession);
    }
    async getResponseStateByCorrelationId(correlationId, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findById(this.agentContext, correlationId);
        const responseState = await this.getResponseStateFromSessionRecord(verificationSession);
        if (!responseState) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization response state for correlation id ${correlationId} not found`);
            return undefined;
        }
        return responseState;
    }
    async getResponseStateByNonce(nonce, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findSingleByQuery(this.agentContext, {
            verifierId: this.verifierId,
            nonce,
        });
        const responseState = await this.getResponseStateFromSessionRecord(verificationSession);
        if (!responseState) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization response state for nonce ${nonce} not found`);
            return undefined;
        }
        return responseState;
    }
    async getResponseStateByState(state, errorOnNotFound) {
        const verificationSession = await this.openId4VcVerificationSessionRepository.findSingleByQuery(this.agentContext, {
            verifierId: this.verifierId,
            payloadState: state,
        });
        const responseState = await this.getResponseStateFromSessionRecord(verificationSession);
        if (!responseState) {
            if (errorOnNotFound)
                throw new core_1.CredoError(`OpenID4VC Authorization response state for state ${state} not found`);
            return undefined;
        }
        return responseState;
    }
    async getCorrelationIdByNonce(nonce, errorOnNotFound) {
        const requestState = await this.getRequestStateByNonce(nonce, errorOnNotFound);
        return requestState === null || requestState === void 0 ? void 0 : requestState.correlationId;
    }
    async getCorrelationIdByState(state, errorOnNotFound) {
        const requestState = await this.getRequestStateByState(state, errorOnNotFound);
        return requestState === null || requestState === void 0 ? void 0 : requestState.correlationId;
    }
    async deleteStateForCorrelationId() {
        throw new Error('Method not implemented.');
    }
    async getRequestStateFromSessionRecord(sessionRecord) {
        var _a, _b;
        const lastUpdated = (_b = (_a = sessionRecord.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : sessionRecord.createdAt.getTime();
        return {
            lastUpdated,
            timestamp: lastUpdated,
            correlationId: sessionRecord.id,
            // Not so nice that the session manager expects an error instance.....
            error: sessionRecord.errorMessage ? new Error(sessionRecord.errorMessage) : undefined,
            request: await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(sessionRecord.authorizationRequestJwt),
            status: sphereonAuthorizationRequestStateFromOpenId4VcVerificationState(sessionRecord.state),
        };
    }
    async getResponseStateFromSessionRecord(sessionRecord) {
        var _a, _b;
        if (!sessionRecord)
            return undefined;
        const lastUpdated = (_b = (_a = sessionRecord.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : sessionRecord.createdAt.getTime();
        // If we don't have the authorization response payload yet, it means we haven't
        // received the response yet, and thus the response state does not exist yet
        if (!sessionRecord.authorizationResponsePayload) {
            return undefined;
        }
        return {
            lastUpdated,
            timestamp: lastUpdated,
            correlationId: sessionRecord.id,
            // Not so nice that the session manager expects an error instance.....
            error: sessionRecord.errorMessage ? new Error(sessionRecord.errorMessage) : undefined,
            response: await did_auth_siop_1.AuthorizationResponse.fromPayload(sessionRecord.authorizationResponsePayload),
            status: sphereonAuthorizationResponseStateFromOpenId4VcVerificationState(sessionRecord.state),
        };
    }
}
exports.OpenId4VcRelyingPartySessionManager = OpenId4VcRelyingPartySessionManager;
function sphereonAuthorizationResponseStateFromOpenId4VcVerificationState(state) {
    if (state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error)
        return did_auth_siop_1.AuthorizationResponseStateStatus.ERROR;
    if (state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified)
        return did_auth_siop_1.AuthorizationResponseStateStatus.VERIFIED;
    throw new core_1.CredoError(`Can not map OpenId4VcVerificationSessionState ${state} to AuthorizationResponseStateStatus`);
}
function sphereonAuthorizationRequestStateFromOpenId4VcVerificationState(state) {
    if (state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.Error)
        return did_auth_siop_1.AuthorizationRequestStateStatus.ERROR;
    if ([OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated, OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.ResponseVerified].includes(state)) {
        return did_auth_siop_1.AuthorizationRequestStateStatus.CREATED;
    }
    if (state === OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved)
        return did_auth_siop_1.AuthorizationRequestStateStatus.SENT;
    throw new core_1.CredoError(`Can not map OpenId4VcVerificationSessionState ${state} to AuthorizationRequestStateStatus`);
}
//# sourceMappingURL=OpenId4VcRelyingPartySessionManager.js.map