import type { CredoWalletWebCrypto } from './CredoWalletWebCrypto';
import * as core from 'webcrypto-core';
export declare class CredoSubtle extends core.SubtleCrypto {
    constructor(walletWebCrypto: CredoWalletWebCrypto);
}
