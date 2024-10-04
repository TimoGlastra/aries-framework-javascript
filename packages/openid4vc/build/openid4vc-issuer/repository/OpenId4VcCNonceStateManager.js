"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcCNonceStateManager = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcIssuerModuleConfig_1 = require("../OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuanceSessionRepository_1 = require("./OpenId4VcIssuanceSessionRepository");
class OpenId4VcCNonceStateManager {
    constructor(agentContext, issuerId) {
        this.agentContext = agentContext;
        this.issuerId = issuerId;
        this.openId4VcIssuanceSessionRepository = agentContext.dependencyManager.resolve(OpenId4VcIssuanceSessionRepository_1.OpenId4VcIssuanceSessionRepository);
        this.openId4VcIssuerModuleConfig = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
    }
    async set(cNonce, stateValue) {
        // Just to make sure that the cNonce is the same as the id as that's what we use to query
        if (cNonce !== stateValue.cNonce) {
            throw new core_1.CredoError('Expected the id of the cNonce state to be equal to the cNonce');
        }
        if (!stateValue.preAuthorizedCode) {
            throw new core_1.CredoError("Expected the stateValue to have a 'preAuthorizedCode' property");
        }
        // Record MUST exist (otherwise there's no issuance session active yet)
        const record = await this.openId4VcIssuanceSessionRepository.getSingleByQuery(this.agentContext, {
            // NOTE: once we support authorized flow, we need to add an $or for the issuer state as well
            issuerId: this.issuerId,
            preAuthorizedCode: stateValue.preAuthorizedCode,
        });
        // cNonce already matches, no need to update
        if (record.cNonce === stateValue.cNonce) {
            return;
        }
        const expiresAtDate = new Date(Date.now() + this.openId4VcIssuerModuleConfig.accessTokenEndpoint.cNonceExpiresInSeconds * 1000);
        record.cNonce = stateValue.cNonce;
        record.cNonceExpiresAt = expiresAtDate;
        await this.openId4VcIssuanceSessionRepository.update(this.agentContext, record);
    }
    async get(cNonce) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            cNonce,
        });
        if (!record)
            return undefined;
        // NOTE: This should not happen as we query by the credential offer uri
        // so it's mostly to make TS happy
        if (!record.cNonce) {
            throw new core_1.CredoError('No cNonce found on record.');
        }
        return {
            cNonce: record.cNonce,
            preAuthorizedCode: record.preAuthorizedCode,
            createdAt: record.createdAt.getTime(),
        };
    }
    async has(cNonce) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            cNonce,
        });
        return record !== undefined;
    }
    async delete(cNonce) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            cNonce,
        });
        if (!record)
            return false;
        // We only remove the cNonce from the record, we don't want to remove
        // the whole issuance session.
        record.cNonce = undefined;
        record.cNonceExpiresAt = undefined;
        await this.openId4VcIssuanceSessionRepository.update(this.agentContext, record);
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
    async getAsserted(id) {
        const state = await this.get(id);
        if (!state) {
            throw new core_1.CredoError(`No cNonce state found for id ${id}`);
        }
        return state;
    }
    async startCleanupRoutine() {
        throw new Error('Method not implemented.');
    }
    async stopCleanupRoutine() {
        throw new Error('Method not implemented.');
    }
}
exports.OpenId4VcCNonceStateManager = OpenId4VcCNonceStateManager;
//# sourceMappingURL=OpenId4VcCNonceStateManager.js.map