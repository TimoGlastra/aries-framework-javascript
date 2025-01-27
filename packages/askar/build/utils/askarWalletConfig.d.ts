import type { WalletConfig } from '@credo-ts/core';
import { KeyDerivationMethod } from '@credo-ts/core';
import { StoreKeyMethod } from '@hyperledger/aries-askar-shared';
export declare const keyDerivationMethodToStoreKeyMethod: (keyDerivationMethod: KeyDerivationMethod) => StoreKeyMethod;
/**
 * Creates a proper askar wallet URI value based on walletConfig
 * @param walletConfig WalletConfig object
 * @param credoDataPath framework data path (used in case walletConfig.storage.path is undefined)
 * @returns string containing the askar wallet URI
 */
export declare const uriFromWalletConfig: (walletConfig: WalletConfig, credoDataPath: string) => {
    uri: string;
    path?: string;
};
