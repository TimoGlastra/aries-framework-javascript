"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarWallet = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const tsyringe_1 = require("tsyringe");
const utils_1 = require("../utils");
const AskarBaseWallet_1 = require("./AskarBaseWallet");
const AskarWalletStorageConfig_1 = require("./AskarWalletStorageConfig");
/**
 * @todo: rename after 0.5.0, as we now have multiple types of AskarWallet
 */
let AskarWallet = class AskarWallet extends AskarBaseWallet_1.AskarBaseWallet {
    constructor(logger, fileSystem, signingKeyProviderRegistry) {
        super(logger, signingKeyProviderRegistry);
        this.fileSystem = fileSystem;
    }
    get isProvisioned() {
        return this.walletConfig !== undefined;
    }
    get isInitialized() {
        return this._store !== undefined;
    }
    get store() {
        if (!this._store) {
            throw new core_1.CredoError('Wallet has not been initialized yet. Make sure to await agent.initialize() before using the agent.');
        }
        return this._store;
    }
    get profile() {
        if (!this.walletConfig) {
            throw new core_1.WalletError('No profile configured.');
        }
        return this.walletConfig.id;
    }
    /**
     * Dispose method is called when an agent context is disposed.
     */
    async dispose() {
        if (this.isInitialized) {
            await this.close();
        }
    }
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    async create(walletConfig) {
        await this.createAndOpen(walletConfig);
        await this.close();
    }
    /**
     * @throws {WalletDuplicateError} if the wallet already exists
     * @throws {WalletError} if another error occurs
     */
    async createAndOpen(walletConfig) {
        this.logger.debug(`Creating wallet '${walletConfig.id}`);
        const askarWalletConfig = await this.getAskarWalletConfig(walletConfig);
        // Check if database exists
        const { path: filePath } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
        if (filePath && (await this.fileSystem.exists(filePath))) {
            throw new core_1.WalletDuplicateError(`Wallet '${walletConfig.id}' already exists.`, {
                walletType: 'AskarWallet',
            });
        }
        try {
            // Make sure path exists before creating the wallet
            if (filePath) {
                await this.fileSystem.createDirectory(filePath);
            }
            this._store = await aries_askar_shared_1.Store.provision({
                recreate: false,
                uri: askarWalletConfig.uri,
                profile: askarWalletConfig.profile,
                keyMethod: askarWalletConfig.keyMethod,
                passKey: askarWalletConfig.passKey,
            });
            // TODO: Should we do something to check if it exists?
            // Like this.withSession()?
            this.walletConfig = walletConfig;
        }
        catch (error) {
            // FIXME: Askar should throw a Duplicate error code, but is currently returning Encryption
            // And if we provide the very same wallet key, it will open it without any error
            if ((0, utils_1.isAskarError)(error) &&
                (error.code === utils_1.AskarErrorCode.Encryption || error.code === utils_1.AskarErrorCode.Duplicate)) {
                const errorMessage = `Wallet '${walletConfig.id}' already exists`;
                this.logger.debug(errorMessage);
                throw new core_1.WalletDuplicateError(errorMessage, {
                    walletType: 'AskarWallet',
                    cause: error,
                });
            }
            const errorMessage = `Error creating wallet '${walletConfig.id}'`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
        this.logger.debug(`Successfully created wallet '${walletConfig.id}'`);
    }
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    async open(walletConfig) {
        await this._open(walletConfig);
    }
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    async rotateKey(walletConfig) {
        if (!walletConfig.rekey) {
            throw new core_1.WalletError('Wallet rekey undefined!. Please specify the new wallet key');
        }
        await this._open({
            id: walletConfig.id,
            key: walletConfig.key,
            keyDerivationMethod: walletConfig.keyDerivationMethod,
        }, walletConfig.rekey, walletConfig.rekeyDerivationMethod);
    }
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    async _open(walletConfig, rekey, rekeyDerivation) {
        var _a;
        if (this._store) {
            throw new core_1.WalletError('Wallet instance already opened. Close the currently opened wallet before re-opening the wallet');
        }
        const askarWalletConfig = await this.getAskarWalletConfig(walletConfig);
        try {
            this._store = await aries_askar_shared_1.Store.open({
                uri: askarWalletConfig.uri,
                keyMethod: askarWalletConfig.keyMethod,
                passKey: askarWalletConfig.passKey,
            });
            if (rekey) {
                await this._store.rekey({
                    passKey: rekey,
                    keyMethod: (0, utils_1.keyDerivationMethodToStoreKeyMethod)(rekeyDerivation !== null && rekeyDerivation !== void 0 ? rekeyDerivation : core_1.KeyDerivationMethod.Argon2IMod),
                });
            }
            // TODO: Should we do something to check if it exists?
            // Like this.withSession()?
            this.walletConfig = walletConfig;
        }
        catch (error) {
            if ((0, utils_1.isAskarError)(error) &&
                (error.code === utils_1.AskarErrorCode.NotFound ||
                    (error.code === utils_1.AskarErrorCode.Backend &&
                        (0, AskarWalletStorageConfig_1.isAskarWalletSqliteStorageConfig)(walletConfig.storage) &&
                        ((_a = walletConfig.storage.config) === null || _a === void 0 ? void 0 : _a.inMemory)))) {
                const errorMessage = `Wallet '${walletConfig.id}' not found`;
                this.logger.debug(errorMessage);
                throw new core_1.WalletNotFoundError(errorMessage, {
                    walletType: 'AskarWallet',
                    cause: error,
                });
            }
            else if ((0, utils_1.isAskarError)(error) && error.code === utils_1.AskarErrorCode.Encryption) {
                const errorMessage = `Incorrect key for wallet '${walletConfig.id}'`;
                this.logger.debug(errorMessage);
                throw new core_1.WalletInvalidKeyError(errorMessage, {
                    walletType: 'AskarWallet',
                    cause: error,
                });
            }
            throw new core_1.WalletError(`Error opening wallet ${walletConfig.id}: ${error.message}`, { cause: error });
        }
        this.logger.debug(`Wallet '${walletConfig.id}' opened with handle '${this._store.handle.handle}'`);
    }
    /**
     * @throws {WalletNotFoundError} if the wallet does not exist
     * @throws {WalletError} if another error occurs
     */
    async delete() {
        if (!this.walletConfig) {
            throw new core_1.WalletError('Can not delete wallet that does not have wallet config set. Make sure to call create wallet before deleting the wallet');
        }
        this.logger.info(`Deleting wallet '${this.walletConfig.id}'`);
        if (this._store) {
            await this.close();
        }
        try {
            const { uri } = (0, utils_1.uriFromWalletConfig)(this.walletConfig, this.fileSystem.dataPath);
            await aries_askar_shared_1.Store.remove(uri);
        }
        catch (error) {
            const errorMessage = `Error deleting wallet '${this.walletConfig.id}': ${error.message}`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
    }
    async export(exportConfig) {
        var _a;
        if (!this.walletConfig) {
            throw new core_1.WalletError('Can not export wallet that does not have wallet config set. Make sure to open it before exporting');
        }
        const { path: destinationPath, key: exportKey } = exportConfig;
        const { path: sourcePath } = (0, utils_1.uriFromWalletConfig)(this.walletConfig, this.fileSystem.dataPath);
        if ((0, AskarWalletStorageConfig_1.isAskarWalletSqliteStorageConfig)(this.walletConfig.storage) && ((_a = this.walletConfig.storage) === null || _a === void 0 ? void 0 : _a.inMemory)) {
            throw new core_1.WalletExportUnsupportedError('Export is not supported for in memory wallet');
        }
        if (!sourcePath) {
            throw new core_1.WalletExportUnsupportedError('Export is only supported for SQLite backend');
        }
        try {
            // Export path already exists
            if (await this.fileSystem.exists(destinationPath)) {
                throw new core_1.WalletExportPathExistsError(`Unable to create export, wallet export at path '${exportConfig.path}' already exists`);
            }
            const exportedWalletConfig = await this.getAskarWalletConfig(Object.assign(Object.assign({}, this.walletConfig), { key: exportKey, storage: { type: 'sqlite', config: { path: destinationPath } } }));
            // Make sure destination path exists
            await this.fileSystem.createDirectory(destinationPath);
            await this.store.copyTo({
                recreate: false,
                uri: exportedWalletConfig.uri,
                keyMethod: exportedWalletConfig.keyMethod,
                passKey: exportedWalletConfig.passKey,
            });
        }
        catch (error) {
            const errorMessage = `Error exporting wallet '${this.walletConfig.id}': ${error.message}`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            if (error instanceof core_1.WalletExportPathExistsError)
                throw error;
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
    }
    async import(walletConfig, importConfig) {
        const { path: sourcePath, key: importKey } = importConfig;
        const { path: destinationPath } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
        if (!destinationPath) {
            throw new core_1.WalletError('Import is only supported for SQLite backend');
        }
        let sourceWalletStore = undefined;
        try {
            const importWalletConfig = await this.getAskarWalletConfig(walletConfig);
            // Import path already exists
            if (await this.fileSystem.exists(destinationPath)) {
                throw new core_1.WalletExportPathExistsError(`Unable to import wallet. Path '${destinationPath}' already exists`);
            }
            // Make sure destination path exists
            await this.fileSystem.createDirectory(destinationPath);
            // Open imported wallet and copy to destination
            sourceWalletStore = await aries_askar_shared_1.Store.open({
                uri: `sqlite://${sourcePath}`,
                keyMethod: importWalletConfig.keyMethod,
                passKey: importKey,
            });
            const defaultProfile = await sourceWalletStore.getDefaultProfile();
            if (defaultProfile !== importWalletConfig.profile) {
                throw new core_1.WalletError(`Trying to import wallet with walletConfig.id ${importWalletConfig.profile}, however the wallet contains a default profile with id ${defaultProfile}. The walletConfig.id MUST match with the default profile. In the future this behavior may be changed. See https://github.com/hyperledger/aries-askar/issues/221 for more information.`);
            }
            await sourceWalletStore.copyTo({
                recreate: false,
                uri: importWalletConfig.uri,
                keyMethod: importWalletConfig.keyMethod,
                passKey: importWalletConfig.passKey,
            });
            await sourceWalletStore.close();
        }
        catch (error) {
            await (sourceWalletStore === null || sourceWalletStore === void 0 ? void 0 : sourceWalletStore.close());
            const errorMessage = `Error importing wallet '${walletConfig.id}': ${error.message}`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            if (error instanceof core_1.WalletImportPathExistsError)
                throw error;
            // Cleanup any wallet file we could have created
            if (await this.fileSystem.exists(destinationPath)) {
                await this.fileSystem.delete(destinationPath);
            }
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
    }
    /**
     * @throws {WalletError} if the wallet is already closed or another error occurs
     */
    async close() {
        var _a;
        this.logger.debug(`Closing wallet ${(_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.id}`);
        if (!this._store) {
            throw new core_1.WalletError('Wallet is in invalid state, you are trying to close wallet that has no handle.');
        }
        try {
            await this.store.close();
            this._store = undefined;
        }
        catch (error) {
            const errorMessage = `Error closing wallet': ${error.message}`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
    }
    async getAskarWalletConfig(walletConfig) {
        var _a;
        const { uri, path } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
        return {
            uri,
            path,
            profile: walletConfig.id,
            // FIXME: Default derivation method should be set somewhere in either agent config or some constants
            keyMethod: (0, utils_1.keyDerivationMethodToStoreKeyMethod)((_a = walletConfig.keyDerivationMethod) !== null && _a !== void 0 ? _a : core_1.KeyDerivationMethod.Argon2IMod),
            passKey: walletConfig.key,
        };
    }
};
exports.AskarWallet = AskarWallet;
exports.AskarWallet = AskarWallet = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(core_1.InjectionSymbols.Logger)),
    __param(1, (0, tsyringe_1.inject)(core_1.InjectionSymbols.FileSystem)),
    __metadata("design:paramtypes", [Object, Object, core_1.SigningProviderRegistry])
], AskarWallet);
//# sourceMappingURL=AskarWallet.js.map