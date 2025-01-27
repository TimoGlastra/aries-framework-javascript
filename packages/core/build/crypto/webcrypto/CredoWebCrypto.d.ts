import type { AgentContext } from '../../agent';
import * as core from 'webcrypto-core';
import { CredoSubtle } from './CredoSubtle';
export declare class CredoWebCrypto extends core.Crypto {
    private walletWebCrypto;
    subtle: CredoSubtle;
    constructor(agentContext: AgentContext);
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
    digest(algorithm: string, data: ArrayBuffer): ArrayBuffer;
}
