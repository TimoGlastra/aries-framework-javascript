import type { CredoWalletWebCrypto } from '../CredoWalletWebCrypto';
import type { CredoWebCryptoKeyPair, EcdsaParams, EcKeyGenParams, EcKeyImportParams, JsonWebKey, KeyFormat, KeyUsage } from '../types';
import * as core from 'webcrypto-core';
import { CredoWebCryptoKey } from '../CredoWebCryptoKey';
export declare class CredoEcdsaProvider extends core.EcdsaProvider {
    private walletWebCrypto;
    constructor(walletWebCrypto: CredoWalletWebCrypto);
    onSign(algorithm: EcdsaParams, key: CredoWebCryptoKey, data: ArrayBuffer): Promise<ArrayBuffer>;
    onVerify(algorithm: EcdsaParams, key: CredoWebCryptoKey, signature: ArrayBuffer, data: ArrayBuffer): Promise<boolean>;
    onGenerateKey(algorithm: EcKeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CredoWebCryptoKeyPair>;
    onExportKey(format: KeyFormat, key: CredoWebCryptoKey): Promise<JsonWebKey | ArrayBuffer>;
    onImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: EcKeyImportParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CredoWebCryptoKey>;
}
