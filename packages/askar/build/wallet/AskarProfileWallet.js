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
exports.AskarProfileWallet = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const tsyringe_1 = require("tsyringe");
const utils_1 = require("../utils");
const AskarBaseWallet_1 = require("./AskarBaseWallet");
let AskarProfileWallet = class AskarProfileWallet extends AskarBaseWallet_1.AskarBaseWallet {
    constructor(store, logger, signingKeyProviderRegistry) {
        super(logger, signingKeyProviderRegistry);
        this.isInitialized = false;
        this.store = store;
    }
    get isProvisioned() {
        return this.walletConfig !== undefined;
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
    async create(walletConfig) {
        this.logger.debug(`Creating wallet for profile '${walletConfig.id}'`);
        try {
            await this.store.createProfile(walletConfig.id);
        }
        catch (error) {
            if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                const errorMessage = `Wallet for profile '${walletConfig.id}' already exists`;
                this.logger.debug(errorMessage);
                throw new core_1.WalletDuplicateError(errorMessage, {
                    walletType: 'AskarProfileWallet',
                    cause: error,
                });
            }
            const errorMessage = `Error creating wallet for profile '${walletConfig.id}'`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
        this.logger.debug(`Successfully created wallet for profile '${walletConfig.id}'`);
    }
    async open(walletConfig) {
        this.logger.debug(`Opening wallet for profile '${walletConfig.id}'`);
        try {
            this.walletConfig = walletConfig;
            // TODO: what is faster? listProfiles or open and close session?
            // I think open/close is more scalable (what if profiles is 10.000.000?)
            // We just want to check if the profile exists. Because the wallet initialization logic
            // first tries to open, and if it doesn't exist it will create it. So we must check here
            // if the profile exists
            await this.withSession(() => {
                /* no-op */
            });
            this.isInitialized = true;
        }
        catch (error) {
            // Profile does not exist
            if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.NotFound)) {
                const errorMessage = `Wallet for profile '${walletConfig.id}' not found`;
                this.logger.debug(errorMessage);
                throw new core_1.WalletNotFoundError(errorMessage, {
                    walletType: 'AskarProfileWallet',
                    cause: error,
                });
            }
            const errorMessage = `Error opening wallet for profile '${walletConfig.id}'`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
        this.logger.debug(`Successfully opened wallet for profile '${walletConfig.id}'`);
    }
    async createAndOpen(walletConfig) {
        await this.create(walletConfig);
        await this.open(walletConfig);
    }
    async delete() {
        if (!this.walletConfig) {
            throw new core_1.WalletError('Can not delete wallet that does not have wallet config set. Make sure to call create wallet before deleting the wallet');
        }
        this.logger.info(`Deleting profile '${this.profile}'`);
        if (this.isInitialized) {
            await this.close();
        }
        try {
            await this.store.removeProfile(this.profile);
        }
        catch (error) {
            const errorMessage = `Error deleting wallet for profile '${this.profile}': ${error.message}`;
            this.logger.error(errorMessage, {
                error,
                errorMessage: error.message,
            });
            throw new core_1.WalletError(errorMessage, { cause: error });
        }
    }
    async export() {
        // This PR should help with this: https://github.com/hyperledger/aries-askar/pull/159
        throw new core_1.WalletExportUnsupportedError('Exporting a profile is not supported.');
    }
    async import() {
        // This PR should help with this: https://github.com/hyperledger/aries-askar/pull/159
        throw new core_1.WalletError('Importing a profile is not supported.');
    }
    async rotateKey() {
        throw new core_1.WalletError('Rotating a key is not supported for a profile. You can rotate the key on the main askar wallet.');
    }
    async close() {
        var _a;
        this.logger.debug(`Closing wallet for profile ${(_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.id}`);
        if (!this.isInitialized) {
            throw new core_1.WalletError('Wallet is in invalid state, you are trying to close wallet that is not initialized.');
        }
        this.isInitialized = false;
    }
};
exports.AskarProfileWallet = AskarProfileWallet;
exports.AskarProfileWallet = AskarProfileWallet = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(1, (0, tsyringe_1.inject)(core_1.InjectionSymbols.Logger)),
    __metadata("design:paramtypes", [aries_askar_shared_1.Store, Object, core_1.SigningProviderRegistry])
], AskarProfileWallet);
//# sourceMappingURL=AskarProfileWallet.js.map