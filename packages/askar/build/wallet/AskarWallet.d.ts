import type { WalletConfig, WalletConfigRekey, WalletExportImportConfig } from '@credo-ts/core';
import { Logger, SigningProviderRegistry, FileSystem } from '@credo-ts/core';
import { Store } from '@hyperledger/aries-askar-shared';
import { AskarBaseWallet } from './AskarBaseWallet';
/**
 * @todo: rename after 0.5.0, as we now have multiple types of AskarWallet
 */
export declare class AskarWallet extends AskarBaseWallet {
    private fileSystem;
    private walletConfig?;
    private _store?;
    constructor(logger: Logger, fileSystem: FileSystem, signingKeyProviderRegistry: SigningProviderRegistry);
    get isProvisioned(): boolean;
    get isInitialized(): boolean;
    get store(): Store;
    get profile(): string;
    /**
     * Dispose method is called when an agent context is disposed.
     */
    dispose(): Promise<void>;
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    create(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    createAndOpen(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    open(walletConfig: WalletConfig): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    rotateKey(walletConfig: WalletConfigRekey): Promise<void>;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    private _open;
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    delete(): Promise<void>;
    export(exportConfig: WalletExportImportConfig): Promise<void>;
    import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>;
    /**
     * @throws {WalletError} if the wallet is already closed or another error occurs
     */
    close(): Promise<void>;
    private getAskarWalletConfig;
}
