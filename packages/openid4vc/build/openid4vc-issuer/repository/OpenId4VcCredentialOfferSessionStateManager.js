"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcCredentialOfferSessionStateManager = void 0;
const core_1 = require("@credo-ts/core");
const oid4vci_common_1 = require("@sphereon/oid4vci-common");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerEvents_1 = require("../OpenId4VcIssuerEvents");
const OpenId4VcIssuanceSessionRecord_1 = require("./OpenId4VcIssuanceSessionRecord");
const OpenId4VcIssuanceSessionRepository_1 = require("./OpenId4VcIssuanceSessionRepository");
class OpenId4VcCredentialOfferSessionStateManager {
    constructor(agentContext, issuerId) {
        this.agentContext = agentContext;
        this.issuerId = issuerId;
        this.openId4VcIssuanceSessionRepository = agentContext.dependencyManager.resolve(OpenId4VcIssuanceSessionRepository_1.OpenId4VcIssuanceSessionRepository);
        this.eventEmitter = agentContext.dependencyManager.resolve(core_1.EventEmitter);
    }
    async set(preAuthorizedCode, stateValue) {
        var _a, _b, _c, _d;
        // Just to make sure that the preAuthorizedCode is the same as the id as that's what we use to query
        // NOTE: once we support authorized flow, we need to also allow the id to be equal to issuer state
        if (preAuthorizedCode !== stateValue.preAuthorizedCode) {
            throw new core_1.CredoError('Expected the id of the credential offer state to be equal to the preAuthorizedCode');
        }
        if (!stateValue.preAuthorizedCode) {
            throw new core_1.CredoError("Expected the stateValue to have a 'preAuthorizedCode' property");
        }
        // Record may already exist
        let record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            preAuthorizedCode: stateValue.preAuthorizedCode,
        });
        const previousState = (_a = record === null || record === void 0 ? void 0 : record.state) !== null && _a !== void 0 ? _a : null;
        let credentialOfferUri = stateValue.credentialOffer.credential_offer_uri;
        if (!credentialOfferUri) {
            throw new core_1.CredoError("Expected the stateValue to have a 'credentialOfferUri' property");
        }
        if (credentialOfferUri.includes('credential_offer_uri=')) {
            // NOTE: it's a bit cumbersome, but the credential_offer_uri is the encoded uri. This seems
            // odd to me, as this is the offer payload, which should only contain the hosted URI (I think
            // this is a bug in OID4VCI). But for now we have to extract the uri from the payload.
            credentialOfferUri = decodeURIComponent(credentialOfferUri.split('credential_offer_uri=')[1].split('=')[0]);
        }
        let state = openId4VcIssuanceStateFromSphereon(stateValue.status);
        if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued) {
            // we set the completed state manually when all credentials have been issued
            const issuedCredentials = (_c = (_b = record === null || record === void 0 ? void 0 : record.issuedCredentials) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
            const credentialOffer = stateValue.credentialOffer.credential_offer;
            const offeredCredentials = (0, utils_1.isCredentialOfferV1Draft13)(credentialOffer)
                ? credentialOffer.credential_configuration_ids // v13
                : credentialOffer.credentials; // v11
            if (issuedCredentials >= offeredCredentials.length) {
                state = OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Completed;
            }
        }
        // TODO: sphereon currently sets the wrong prop
        const userPin = (_d = stateValue.txCode) !== null && _d !== void 0 ? _d : ('userPin' in stateValue && typeof stateValue.userPin === 'string' ? stateValue.userPin : undefined);
        // NOTE: we don't use clientId at the moment, will become relevant when doing the authorized flow
        if (record) {
            record.issuanceMetadata = stateValue.credentialDataSupplierInput;
            record.credentialOfferPayload = stateValue.credentialOffer.credential_offer;
            record.userPin = userPin;
            record.preAuthorizedCode = stateValue.preAuthorizedCode;
            record.errorMessage = stateValue.error;
            record.credentialOfferUri = credentialOfferUri;
            record.state = state;
            await this.openId4VcIssuanceSessionRepository.update(this.agentContext, record);
        }
        else {
            record = new OpenId4VcIssuanceSessionRecord_1.OpenId4VcIssuanceSessionRecord({
                issuerId: this.issuerId,
                preAuthorizedCode: stateValue.preAuthorizedCode,
                issuanceMetadata: stateValue.credentialDataSupplierInput,
                credentialOfferPayload: stateValue.credentialOffer.credential_offer,
                credentialOfferUri,
                userPin: userPin,
                errorMessage: stateValue.error,
                state: state,
            });
            await this.openId4VcIssuanceSessionRepository.save(this.agentContext, record);
        }
        this.emitStateChangedEvent(this.agentContext, record, previousState);
    }
    async get(preAuthorizedCode) {
        var _a, _b;
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            preAuthorizedCode,
        });
        if (!record)
            return undefined;
        // NOTE: This should not happen as we query by the preAuthorizedCode
        // so it's mostly to make TS happy
        if (!record.preAuthorizedCode) {
            throw new core_1.CredoError("No 'preAuthorizedCode' found on record.");
        }
        if (!record.credentialOfferPayload) {
            throw new core_1.CredoError("No 'credentialOfferPayload' found on record.");
        }
        return {
            credentialOffer: {
                credential_offer: record.credentialOfferPayload,
                credential_offer_uri: record.credentialOfferUri,
            },
            notification_id: '', // TODO! This probably needs to have a different structure allowing to receive notifications on a per credential request basis
            status: sphereonIssueStatusFromOpenId4VcIssuanceState(record.state),
            preAuthorizedCode: record.preAuthorizedCode,
            credentialDataSupplierInput: record.issuanceMetadata,
            error: record.errorMessage,
            txCode: record.userPin,
            createdAt: record.createdAt.getTime(),
            lastUpdatedAt: (_b = (_a = record.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : record.createdAt.getTime(),
        };
    }
    async has(preAuthorizedCode) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            preAuthorizedCode,
        });
        return record !== undefined;
    }
    async delete(preAuthorizedCode) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            preAuthorizedCode,
        });
        if (!record)
            return false;
        await this.openId4VcIssuanceSessionRepository.deleteById(this.agentContext, record.id);
        return true;
    }
    async clearExpired() {
        // FIXME: we should have a way to remove expired records
        // or just not return the value in the get if the record is expired
        throw new Error('Method not implemented.');
    }
    async clearAll() {
        throw new Error('Method not implemented.');
    }
    async getAsserted(preAuthorizedCode) {
        const state = await this.get(preAuthorizedCode);
        if (!state) {
            throw new core_1.CredoError(`No credential offer state found for id ${preAuthorizedCode}`);
        }
        return state;
    }
    async startCleanupRoutine() {
        throw new Error('Method not implemented.');
    }
    async stopCleanupRoutine() {
        throw new Error('Method not implemented.');
    }
    emitStateChangedEvent(agentContext, issuanceSession, previousState) {
        this.eventEmitter.emit(agentContext, {
            type: OpenId4VcIssuerEvents_1.OpenId4VcIssuerEvents.IssuanceSessionStateChanged,
            payload: {
                issuanceSession: issuanceSession.clone(),
                previousState,
            },
        });
    }
}
exports.OpenId4VcCredentialOfferSessionStateManager = OpenId4VcCredentialOfferSessionStateManager;
function openId4VcIssuanceStateFromSphereon(stateValue) {
    if (stateValue === oid4vci_common_1.IssueStatus.OFFER_CREATED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated;
    if (stateValue === oid4vci_common_1.IssueStatus.OFFER_URI_RETRIEVED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved;
    if (stateValue === oid4vci_common_1.IssueStatus.ACCESS_TOKEN_REQUESTED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenRequested;
    if (stateValue === oid4vci_common_1.IssueStatus.ACCESS_TOKEN_CREATED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenCreated;
    if (stateValue === oid4vci_common_1.IssueStatus.CREDENTIAL_REQUEST_RECEIVED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived;
    // we set the completed state manually when all credentials have been issued
    if (stateValue === oid4vci_common_1.IssueStatus.CREDENTIAL_ISSUED)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued;
    if (stateValue === oid4vci_common_1.IssueStatus.ERROR)
        return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error;
    throw new core_1.CredoError(`Unknown state value: ${stateValue}`);
}
function sphereonIssueStatusFromOpenId4VcIssuanceState(state) {
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated)
        return oid4vci_common_1.IssueStatus.OFFER_CREATED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved)
        return oid4vci_common_1.IssueStatus.OFFER_URI_RETRIEVED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenRequested)
        return oid4vci_common_1.IssueStatus.ACCESS_TOKEN_REQUESTED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AccessTokenCreated)
        return oid4vci_common_1.IssueStatus.ACCESS_TOKEN_CREATED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived)
        return oid4vci_common_1.IssueStatus.CREDENTIAL_REQUEST_RECEIVED;
    // sphereon does not have a completed state indicating that all credentials have been issued
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialsPartiallyIssued)
        return oid4vci_common_1.IssueStatus.CREDENTIAL_ISSUED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Completed)
        return oid4vci_common_1.IssueStatus.CREDENTIAL_ISSUED;
    if (state === OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error)
        return oid4vci_common_1.IssueStatus.ERROR;
    throw new core_1.CredoError(`Unknown state value: ${state}`);
}
//# sourceMappingURL=OpenId4VcCredentialOfferSessionStateManager.js.map