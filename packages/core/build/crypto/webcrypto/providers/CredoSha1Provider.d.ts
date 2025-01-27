import type { HashAlgorithm } from '../types';
import * as core from 'webcrypto-core';
export declare class CredoSha1Provider extends core.ProviderCrypto {
    name: string;
    usages: never[];
    onDigest(algorithm: HashAlgorithm, data: ArrayBuffer): Promise<ArrayBuffer>;
}
