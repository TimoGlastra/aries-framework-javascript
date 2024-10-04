import { AgentContext } from '@credo-ts/core';
import { IndyVdrPoolService } from './pool';
export declare class IndyVdrApi {
    private agentContext;
    private indyVdrPoolService;
    constructor(agentContext: AgentContext, indyVdrPoolService: IndyVdrPoolService);
    private multiSignRequest;
    private signRequest;
    /**
     * This method refreshes the pool connection and ensures the pool is up to date with the ledger.
     */
    refreshPoolConnections(): Promise<PromiseSettledResult<void>[]>;
    /**
     * This method gets the updated transactions of the pool.
     * @returns The transactions of the pool ledger
     */
    getAllPoolTransactions(): Promise<PromiseSettledResult<{
        config: import("./pool").IndyVdrPoolConfig;
        transactions: import("@hyperledger/indy-vdr-shared").Transactions;
    }>[]>;
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
    endorseTransaction(transaction: string | Record<string, unknown>, endorserDid: string): Promise<string>;
}
