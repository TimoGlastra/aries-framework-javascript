import type { JsonWebKey, KeyGenAlgorithm, KeyFormat, KeyImportParams, KeySignParams, KeyUsage, KeyVerifyParams } from './types';
import type { AgentContext } from '../../agent';
import { Key } from '../Key';
import { CredoWebCryptoKey } from './CredoWebCryptoKey';
export declare class CredoWalletWebCrypto {
    private agentContext;
    constructor(agentContext: AgentContext);
    generateRandomValues<T extends ArrayBufferView | null>(array: T): T;
    sign(key: CredoWebCryptoKey, message: Uint8Array, _algorithm: KeySignParams): Promise<Uint8Array>;
    verify(key: CredoWebCryptoKey, _algorithm: KeyVerifyParams, message: Uint8Array, signature: Uint8Array): Promise<boolean>;
    generate(algorithm: KeyGenAlgorithm): Promise<Key>;
    importKey(format: KeyFormat, keyData: Uint8Array | JsonWebKey, algorithm: KeyImportParams, extractable: boolean, keyUsages: Array<KeyUsage>): Promise<CredoWebCryptoKey>;
    exportKey(format: KeyFormat, key: CredoWebCryptoKey): Promise<Uint8Array | JsonWebKey>;
}
