import type { WalletConfig } from '@credo-ts/core';
import { Logger, SigningProviderRegistry } from '@credo-ts/core';
import { Store } from '@hyperledger/aries-askar-shared';
import { AskarBaseWallet } from './AskarBaseWallet';
export declare class AskarProfileWallet extends AskarBaseWallet {
    private walletConfig?;
    readonly store: Store;
    isInitialized: boolean;
    constructor(store: Store, logger: Logger, signingKeyProviderRegistry: SigningProviderRegistry);
    get isProvisioned(): boolean;
    get profile(): string;
    /**
     * Dispose method is called when an agent context is disposed.
     */
    dispose(): Promise<void>;
    create(walletConfig: WalletConfig): Promise<void>;
    open(walletConfig: WalletConfig): Promise<void>;
    createAndOpen(walletConfig: WalletConfig): Promise<void>;
    delete(): Promise<void>;
    export(): Promise<void>;
    import(): Promise<void>;
    rotateKey(): Promise<void>;
    close(): Promise<void>;
}
