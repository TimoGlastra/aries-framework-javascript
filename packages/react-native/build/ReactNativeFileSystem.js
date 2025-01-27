"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeFileSystem = void 0;
const core_1 = require("@credo-ts/core");
const react_native_1 = require("react-native");
const RNFS = __importStar(require("react-native-fs"));
class ReactNativeFileSystem {
    /**
     * Create new ReactNativeFileSystem class instance.
     *
     * @param baseDataPath The base path to use for reading and writing data files used within the framework.
     * Files will be created under baseDataPath/.afj directory. If not specified, it will be set to
     * RNFS.DocumentDirectoryPath
     * @param baseCachePath The base path to use for reading and writing cache files used within the framework.
     * Files will be created under baseCachePath/.afj directory. If not specified, it will be set to
     * RNFS.CachesDirectoryPath
     * @param baseTempPath The base path to use for reading and writing temporary files within the framework.
     * Files will be created under baseTempPath/.afj directory. If not specified, it will be set to
     * RNFS.TemporaryDirectoryPath
     *
     * @see https://github.com/itinance/react-native-fs#constants
     */
    constructor(options) {
        var _a;
        this.dataPath = `${(_a = options === null || options === void 0 ? void 0 : options.baseDataPath) !== null && _a !== void 0 ? _a : RNFS.DocumentDirectoryPath}/.afj`;
        // In Android, TemporaryDirectoryPath falls back to CachesDirectoryPath
        this.cachePath = (options === null || options === void 0 ? void 0 : options.baseCachePath)
            ? `${options === null || options === void 0 ? void 0 : options.baseCachePath}/.afj`
            : `${RNFS.CachesDirectoryPath}/.afj${react_native_1.Platform.OS === 'android' ? '/cache' : ''}`;
        this.tempPath = (options === null || options === void 0 ? void 0 : options.baseTempPath)
            ? `${options === null || options === void 0 ? void 0 : options.baseTempPath}/.afj`
            : `${RNFS.TemporaryDirectoryPath}/.afj${react_native_1.Platform.OS === 'android' ? '/temp' : ''}`;
    }
    async exists(path) {
        return RNFS.exists(path);
    }
    async createDirectory(path) {
        await RNFS.mkdir((0, core_1.getDirFromFilePath)(path));
    }
    async copyFile(sourcePath, destinationPath) {
        await RNFS.copyFile(sourcePath, destinationPath);
    }
    async write(path, data) {
        // Make sure parent directories exist
        await RNFS.mkdir((0, core_1.getDirFromFilePath)(path));
        return RNFS.writeFile(path, data, 'utf8');
    }
    async read(path) {
        return RNFS.readFile(path, 'utf8');
    }
    async delete(path) {
        await RNFS.unlink(path);
    }
    async downloadToFile(url, path, options) {
        // Make sure parent directories exist
        await RNFS.mkdir((0, core_1.getDirFromFilePath)(path));
        const fromUrl = this.encodeUriIfRequired(url);
        const { promise } = RNFS.downloadFile({
            fromUrl,
            toFile: path,
        });
        await promise;
        if (options === null || options === void 0 ? void 0 : options.verifyHash) {
            // RNFS returns hash as HEX
            const fileHash = await RNFS.hash(path, options.verifyHash.algorithm);
            const fileHashBuffer = core_1.Buffer.from(fileHash, 'hex');
            // If hash doesn't match, remove file and throw error
            if (fileHashBuffer.compare(options.verifyHash.hash) !== 0) {
                await RNFS.unlink(path);
                throw new core_1.CredoError(`Hash of downloaded file does not match expected hash. Expected: ${core_1.TypedArrayEncoder.toBase58(options.verifyHash.hash)}, Actual: ${core_1.TypedArrayEncoder.toBase58(fileHashBuffer)}`);
            }
        }
    }
    encodeUriIfRequired(uri) {
        // Some characters in the URL might be invalid for
        // the native os to handle. Only encode if necessary.
        return uri === decodeURI(uri) ? encodeURI(uri) : uri;
    }
}
exports.ReactNativeFileSystem = ReactNativeFileSystem;
//# sourceMappingURL=ReactNativeFileSystem.js.map