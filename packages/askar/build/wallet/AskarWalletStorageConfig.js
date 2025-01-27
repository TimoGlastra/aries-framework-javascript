"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAskarWalletSqliteStorageConfig = isAskarWalletSqliteStorageConfig;
exports.isAskarWalletPostgresStorageConfig = isAskarWalletPostgresStorageConfig;
function isAskarWalletSqliteStorageConfig(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'sqlite';
}
function isAskarWalletPostgresStorageConfig(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'postgres';
}
//# sourceMappingURL=AskarWalletStorageConfig.js.map