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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrApi = void 0;
const anoncreds_1 = require("@credo-ts/anoncreds");
const core_1 = require("@credo-ts/core");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const didIndyUtil_1 = require("./dids/didIndyUtil");
const error_1 = require("./error");
const pool_1 = require("./pool");
const sign_1 = require("./utils/sign");
let IndyVdrApi = class IndyVdrApi {
    constructor(agentContext, indyVdrPoolService) {
        this.agentContext = agentContext;
        this.indyVdrPoolService = indyVdrPoolService;
    }
    async multiSignRequest(request, signingKey, identifier) {
        return (0, sign_1.multiSignRequest)(this.agentContext, request, signingKey, identifier);
    }
    async signRequest(request, submitterDid) {
        const { pool } = await this.indyVdrPoolService.getPoolForDid(this.agentContext, submitterDid);
        return (0, sign_1.signRequest)(this.agentContext, pool, request, submitterDid);
    }
    /**
     * This method refreshes the pool connection and ensures the pool is up to date with the ledger.
     */
    refreshPoolConnections() {
        return this.indyVdrPoolService.refreshPoolConnections();
    }
    /**
     * This method gets the updated transactions of the pool.
     * @returns The transactions of the pool ledger
     */
    getAllPoolTransactions() {
        return this.indyVdrPoolService.getAllPoolTransactions();
    }
    /**
     * This method endorses a transaction. The transaction can be either a string or a JSON object.
     * If the transaction has a signature, it means the transaction was created by another author and will be endorsed.
     * This requires the `endorser` on the transaction to be equal to the unqualified variant of the `endorserDid`.
     *
     * If the transaction is not signed, we have a special case where the endorser will author the transaction.
     * This is required when a new did is created, as the author and the endorser did must already exist on the ledger.
     * In this case, the author did (`identifier`) must be equal to the unqualified identifier of the `endorserDid`.
     * @param transaction the transaction body to be endorsed
     * @param endorserDid the did of the endorser
     * @returns An endorsed transaction
     */
    async endorseTransaction(transaction, endorserDid) {
        const endorserSigningKey = await (0, didIndyUtil_1.verificationKeyForIndyDid)(this.agentContext, endorserDid);
        const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(endorserDid);
        const request = new indy_vdr_shared_1.CustomRequest({ customRequest: transaction });
        let endorsedTransaction;
        // the request is not parsed correctly due to too large numbers. The reqId overflows.
        const txBody = typeof transaction === 'string' ? JSON.parse(transaction) : transaction;
        if (txBody.signature) {
            if (txBody.endorser !== namespaceIdentifier)
                throw new error_1.IndyVdrError('Submitter does not match Endorser');
            endorsedTransaction = await this.multiSignRequest(request, endorserSigningKey, namespaceIdentifier);
        }
        else {
            if (txBody.identifier !== namespaceIdentifier)
                throw new error_1.IndyVdrError('Submitter does not match identifier');
            endorsedTransaction = await this.signRequest(request, endorserDid);
        }
        return endorsedTransaction.body;
    }
};
exports.IndyVdrApi = IndyVdrApi;
exports.IndyVdrApi = IndyVdrApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.AgentContext, pool_1.IndyVdrPoolService])
], IndyVdrApi);
//# sourceMappingURL=IndyVdrApi.js.map