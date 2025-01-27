"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarModuleConfig = exports.AskarMultiWalletDatabaseScheme = void 0;
var AskarMultiWalletDatabaseScheme;
(function (AskarMultiWalletDatabaseScheme) {
    /**
     * Each wallet get its own database and uses a separate store.
     */
    AskarMultiWalletDatabaseScheme["DatabasePerWallet"] = "DatabasePerWallet";
    /**
     * All wallets are stored in a single database, but each wallet uses a separate profile.
     */
    AskarMultiWalletDatabaseScheme["ProfilePerWallet"] = "ProfilePerWallet";
})(AskarMultiWalletDatabaseScheme || (exports.AskarMultiWalletDatabaseScheme = AskarMultiWalletDatabaseScheme = {}));
/**
 * @public
 */
class AskarModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link AskarModuleConfigOptions.ariesAskar} */
    get ariesAskar() {
        return this.options.ariesAskar;
    }
    /** See {@link AskarModuleConfigOptions.multiWalletDatabaseScheme} */
    get multiWalletDatabaseScheme() {
        var _a;
        return (_a = this.options.multiWalletDatabaseScheme) !== null && _a !== void 0 ? _a : AskarMultiWalletDatabaseScheme.DatabasePerWallet;
    }
}
exports.AskarModuleConfig = AskarModuleConfig;
//# sourceMappingURL=AskarModuleConfig.js.map