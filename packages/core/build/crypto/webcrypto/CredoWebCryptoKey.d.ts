import type { KeyGenAlgorithm, KeyType, KeyUsage } from './types';
import type { Key } from '../Key';
import * as core from 'webcrypto-core';
export declare class CredoWebCryptoKey extends core.CryptoKey {
    key: Key;
    algorithm: KeyGenAlgorithm;
    extractable: boolean;
    type: KeyType;
    usages: Array<KeyUsage>;
    constructor(key: Key, algorithm: KeyGenAlgorithm, extractable: boolean, type: KeyType, usages: Array<KeyUsage>);
}
