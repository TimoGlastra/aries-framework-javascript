import type { AgentContext, Key } from '@credo-ts/core';
import type { IndyVdrRequest, RequestResponseType } from '@hyperledger/indy-vdr-shared';
export interface TransactionAuthorAgreement {
    version?: `${number}.${number}` | `${number}`;
    acceptanceMechanism: string;
}
export interface AuthorAgreement {
    digest: string;
    version: string;
    text: string;
    ratification_ts: number;
    acceptanceMechanisms: AcceptanceMechanisms;
}
export interface AcceptanceMechanisms {
    aml: Record<string, string>;
    amlContext: string;
    version: string;
}
export interface IndyVdrPoolConfig {
    genesisTransactions: string;
    isProduction: boolean;
    indyNamespace: string;
    transactionAuthorAgreement?: TransactionAuthorAgreement;
    connectOnStartup?: boolean;
}
export declare class IndyVdrPool {
    private _pool?;
    private poolConfig;
    authorAgreement?: AuthorAgreement | null;
    constructor(poolConfig: IndyVdrPoolConfig);
    get indyNamespace(): string;
    get config(): IndyVdrPoolConfig;
    connect(): void;
    /**
     * Refreshes the connection to the pool.
     */
    refreshConnection(): Promise<void>;
    /**
     * Get the transactions for a pool
     */
    get transactions(): Promise<import("@hyperledger/indy-vdr-shared").Transactions>;
    private get pool();
    close(): void;
    prepareWriteRequest<Request extends IndyVdrRequest>(agentContext: AgentContext, request: Request, signingKey: Key, endorserDid?: string): Promise<Request>;
    /**
     * This method submits a request to the ledger.
     * It does only submit the request. It does not modify it in any way.
     * To create the request, use the `prepareWriteRequest` method.
     * @param writeRequest
     */
    submitRequest<Request extends IndyVdrRequest>(writeRequest: Request): Promise<RequestResponseType<Request>>;
    private appendTaa;
    private getTransactionAuthorAgreement;
}
