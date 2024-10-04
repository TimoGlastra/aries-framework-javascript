import type { AgentContext } from '@credo-ts/core';
import type { GetNymResponse } from '@hyperledger/indy-vdr-shared';
import { Logger } from '@credo-ts/core';
import { IndyVdrModuleConfig } from '../IndyVdrModuleConfig';
import { IndyVdrPool } from './IndyVdrPool';
export interface CachedDidResponse {
    nymResponse: {
        did: string;
        verkey: string;
    };
    indyNamespace: string;
}
export declare class IndyVdrPoolService {
    pools: IndyVdrPool[];
    private logger;
    private indyVdrModuleConfig;
    constructor(logger: Logger, indyVdrModuleConfig: IndyVdrModuleConfig);
    /**
     * Get the most appropriate pool for the given did.
     * If the did is a qualified indy did, the pool will be determined based on the namespace.
     * If it is a legacy unqualified indy did, the pool will be determined based on the algorithm as described in this document:
     * https://docs.google.com/document/d/109C_eMsuZnTnYe2OAd02jAts1vC4axwEKIq7_4dnNVA/edit
     *
     * This method will optionally return a nym response when the did has been resolved to determine the ledger
     * either now or in the past. The nymResponse can be used to prevent multiple ledger quries fetching the same
     * did
     */
    getPoolForDid(agentContext: AgentContext, did: string): Promise<{
        pool: IndyVdrPool;
        nymResponse?: CachedDidResponse['nymResponse'];
    }>;
    private getPoolForLegacyDid;
    private getSettledDidResponsesFromPools;
    /**
     * Refresh the pool connections asynchronously
     */
    refreshPoolConnections(): Promise<PromiseSettledResult<void>[]>;
    /**
     * Get all pool transactions
     */
    getAllPoolTransactions(): Promise<PromiseSettledResult<{
        config: import("./IndyVdrPool").IndyVdrPoolConfig;
        transactions: import("@hyperledger/indy-vdr-shared").Transactions;
    }>[]>;
    /**
     * Get the most appropriate pool for the given indyNamespace
     */
    getPoolForNamespace(indyNamespace: string): IndyVdrPool;
    private getDidFromPool;
}
export interface PublicDidRequest {
    did: CachedDidResponse;
    pool: IndyVdrPool;
    response: GetNymResponse;
}
