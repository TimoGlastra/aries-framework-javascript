import type { CredoWalletWebCrypto } from '../CredoWalletWebCrypto';
import type { CredoWebCryptoKeyPair, Ed25519KeyGenParams, Ed25519KeyImportParams, Ed25519Params, JsonWebKey, KeyFormat, KeyUsage } from '../types';
import * as core from 'webcrypto-core';
import { CredoWebCryptoKey } from '../CredoWebCryptoKey';
export declare class CredoEd25519Provider extends core.Ed25519Provider {
    private walletWebCrypto;
    constructor(walletWebCrypto: CredoWalletWebCrypto);
    onSign(algorithm: Ed25519Params, key: CredoWebCryptoKey, data: ArrayBuffer): Promise<ArrayBuffer>;
    onVerify(algorithm: Ed25519Params, key: CredoWebCryptoKey, signature: ArrayBuffer, data: ArrayBuffer): Promise<boolean>;
    onGenerateKey(algorithm: Ed25519KeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CredoWebCryptoKeyPair>;
    onExportKey(format: KeyFormat, key: CredoWebCryptoKey): Promise<JsonWebKey | ArrayBuffer>;
    onImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: Ed25519KeyImportParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CredoWebCryptoKey>;
}
