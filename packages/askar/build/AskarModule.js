"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarModule = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const AskarModuleConfig_1 = require("./AskarModuleConfig");
const storage_1 = require("./storage");
const assertAskarWallet_1 = require("./utils/assertAskarWallet");
const wallet_1 = require("./wallet");
class AskarModule {
    constructor(config) {
        this.config = new AskarModuleConfig_1.AskarModuleConfig(config);
    }
    register(dependencyManager) {
        dependencyManager.registerInstance(AskarModuleConfig_1.AskarModuleConfig, this.config);
        if (dependencyManager.isRegistered(core_1.InjectionSymbols.Wallet)) {
            throw new core_1.CredoError('There is an instance of Wallet already registered');
        }
        else {
            dependencyManager.registerContextScoped(core_1.InjectionSymbols.Wallet, wallet_1.AskarWallet);
            // If the multiWalletDatabaseScheme is set to ProfilePerWallet, we want to register the AskarProfileWallet
            if (this.config.multiWalletDatabaseScheme === AskarModuleConfig_1.AskarMultiWalletDatabaseScheme.ProfilePerWallet) {
                dependencyManager.registerContextScoped(wallet_1.AskarProfileWallet);
            }
        }
        if (dependencyManager.isRegistered(core_1.InjectionSymbols.StorageService)) {
            throw new core_1.CredoError('There is an instance of StorageService already registered');
        }
        else {
            dependencyManager.registerSingleton(core_1.InjectionSymbols.StorageService, storage_1.AskarStorageService);
        }
    }
    async initialize(agentContext) {
        // We MUST use an askar wallet here
        (0, assertAskarWallet_1.assertAskarWallet)(agentContext.wallet);
        const wallet = agentContext.wallet;
        // Register the Askar store instance on the dependency manager
        // This allows it to be re-used for tenants
        agentContext.dependencyManager.registerInstance(aries_askar_shared_1.Store, agentContext.wallet.store);
        // If the multiWalletDatabaseScheme is set to ProfilePerWallet, we want to register the AskarProfileWallet
        // and return that as the wallet for all tenants, but not for the main agent, that should use the AskarWallet
        if (this.config.multiWalletDatabaseScheme === AskarModuleConfig_1.AskarMultiWalletDatabaseScheme.ProfilePerWallet) {
            agentContext.dependencyManager.container.register(core_1.InjectionSymbols.Wallet, {
                useFactory: (container) => {
                    // If the container is the same as the root dependency manager container
                    // it means we are in the main agent, and we should use the root wallet
                    if (container === agentContext.dependencyManager.container) {
                        return wallet;
                    }
                    // Otherwise we want to return the AskarProfileWallet
                    return container.resolve(wallet_1.AskarProfileWallet);
                },
            });
        }
    }
}
exports.AskarModule = AskarModule;
//# sourceMappingURL=AskarModule.js.map