"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcCredentialOfferUriStateManager = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcIssuanceSessionRepository_1 = require("./OpenId4VcIssuanceSessionRepository");
class OpenId4VcCredentialOfferUriStateManager {
    constructor(agentContext, issuerId) {
        this.agentContext = agentContext;
        this.issuerId = issuerId;
        this.openId4VcIssuanceSessionRepository = agentContext.dependencyManager.resolve(OpenId4VcIssuanceSessionRepository_1.OpenId4VcIssuanceSessionRepository);
    }
    async set(uri, stateValue) {
        // Just to make sure that the uri is the same as the id as that's what we use to query
        if (uri !== stateValue.uri) {
            throw new core_1.CredoError('Expected the uri of the uri state to be equal to the id');
        }
        // NOTE: we're currently not ding anything here, as we store the uri in the record
        // when the credential offer session is stored.
    }
    async get(uri) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            credentialOfferUri: uri,
        });
        if (!record)
            return undefined;
        return {
            preAuthorizedCode: record.preAuthorizedCode,
            uri: record.credentialOfferUri,
            createdAt: record.createdAt.getTime(),
        };
    }
    async has(uri) {
        const record = await this.openId4VcIssuanceSessionRepository.findSingleByQuery(this.agentContext, {
            issuerId: this.issuerId,
            credentialOfferUri: uri,
        });
        return record !== undefined;
    }
    async delete() {
        // NOTE: we're not doing anything here as the uri is stored in the credential offer session
        // Not sure how to best handle this, but for now we just don't delete it
        return false;
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
            throw new core_1.CredoError(`No uri state found for id ${id}`);
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
exports.OpenId4VcCredentialOfferUriStateManager = OpenId4VcCredentialOfferUriStateManager;
//# sourceMappingURL=OpenId4VcCredentialOfferUriStateManager.js.map