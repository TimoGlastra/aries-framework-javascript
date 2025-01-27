"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uriFromWalletConfig = exports.keyDerivationMethodToStoreKeyMethod = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const AskarWalletStorageConfig_1 = require("../wallet/AskarWalletStorageConfig");
const keyDerivationMethodToStoreKeyMethod = (keyDerivationMethod) => {
    const correspondenceTable = {
        [core_1.KeyDerivationMethod.Raw]: aries_askar_shared_1.KdfMethod.Raw,
        [core_1.KeyDerivationMethod.Argon2IInt]: aries_askar_shared_1.KdfMethod.Argon2IInt,
        [core_1.KeyDerivationMethod.Argon2IMod]: aries_askar_shared_1.KdfMethod.Argon2IMod,
    };
    return new aries_askar_shared_1.StoreKeyMethod(correspondenceTable[keyDerivationMethod]);
};
exports.keyDerivationMethodToStoreKeyMethod = keyDerivationMethodToStoreKeyMethod;
/**
 * Creates a proper askar wallet URI value based on walletConfig
 * @param walletConfig WalletConfig object
 * @param credoDataPath framework data path (used in case walletConfig.storage.path is undefined)
 * @returns string containing the askar wallet URI
 */
const uriFromWalletConfig = (walletConfig, credoDataPath) => {
    var _a, _b, _c, _d, _e;
    let uri = '';
    let path;
    // By default use sqlite as database backend
    if (!walletConfig.storage) {
        walletConfig.storage = { type: 'sqlite' };
    }
    const urlParams = [];
    const storageConfig = walletConfig.storage;
    if ((0, AskarWalletStorageConfig_1.isAskarWalletSqliteStorageConfig)(storageConfig)) {
        if ((_a = storageConfig.config) === null || _a === void 0 ? void 0 : _a.inMemory) {
            uri = 'sqlite://:memory:';
        }
        else {
            path = (_c = (_b = storageConfig.config) === null || _b === void 0 ? void 0 : _b.path) !== null && _c !== void 0 ? _c : `${credoDataPath}/wallet/${walletConfig.id}/sqlite.db`;
            uri = `sqlite://${path}`;
        }
    }
    else if ((0, AskarWalletStorageConfig_1.isAskarWalletPostgresStorageConfig)(storageConfig)) {
        if (!storageConfig.config || !storageConfig.credentials) {
            throw new core_1.WalletError('Invalid storage configuration for postgres wallet');
        }
        if (storageConfig.config.connectTimeout !== undefined) {
            urlParams.push(`connect_timeout=${encodeURIComponent(storageConfig.config.connectTimeout)}`);
        }
        if (storageConfig.config.idleTimeout !== undefined) {
            urlParams.push(`idle_timeout=${encodeURIComponent(storageConfig.config.idleTimeout)}`);
        }
        if (storageConfig.credentials.adminAccount !== undefined) {
            urlParams.push(`admin_account=${encodeURIComponent(storageConfig.credentials.adminAccount)}`);
        }
        if (storageConfig.credentials.adminPassword !== undefined) {
            urlParams.push(`admin_password=${encodeURIComponent(storageConfig.credentials.adminPassword)}`);
        }
        uri = `postgres://${encodeURIComponent(storageConfig.credentials.account)}:${encodeURIComponent(storageConfig.credentials.password)}@${storageConfig.config.host}/${encodeURIComponent(walletConfig.id)}`;
    }
    else {
        throw new core_1.WalletError(`Storage type not supported: ${storageConfig.type}`);
    }
    // Common config options
    if (((_d = storageConfig.config) === null || _d === void 0 ? void 0 : _d.maxConnections) !== undefined) {
        urlParams.push(`max_connections=${encodeURIComponent(storageConfig.config.maxConnections)}`);
    }
    if (((_e = storageConfig.config) === null || _e === void 0 ? void 0 : _e.minConnections) !== undefined) {
        urlParams.push(`min_connections=${encodeURIComponent(storageConfig.config.minConnections)}`);
    }
    if (urlParams.length > 0) {
        uri = `${uri}?${urlParams.join('&')}`;
    }
    return { uri, path };
};
exports.uriFromWalletConfig = uriFromWalletConfig;
//# sourceMappingURL=askarWalletConfig.js.map