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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFileSystem = void 0;
const core_1 = require("@credo-ts/core");
const crypto_1 = require("crypto");
const fs_1 = __importStar(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const os_1 = require("os");
const path_1 = require("path");
const { access, readFile, writeFile, mkdir, rm, unlink, copyFile } = fs_1.promises;
class NodeFileSystem {
    /**
     * Create new NodeFileSystem class instance.
     *
     * @param baseDataPath The base path to use for reading and writing data files used within the framework.
     * Files will be created under baseDataPath/.afj directory. If not specified, it will be set to homedir()
     * @param baseCachePath The base path to use for reading and writing cache files used within the framework.
     * Files will be created under baseCachePath/.afj directory. If not specified, it will be set to homedir()
     * @param baseTempPath The base path to use for reading and writing temporary files within the framework.
     * Files will be created under baseTempPath/.afj directory. If not specified, it will be set to tmpdir()
     */
    constructor(options) {
        var _a;
        this.dataPath = (options === null || options === void 0 ? void 0 : options.baseDataPath) ? `${options === null || options === void 0 ? void 0 : options.baseDataPath}/.afj` : `${(0, os_1.homedir)()}/.afj/data`;
        this.cachePath = (options === null || options === void 0 ? void 0 : options.baseCachePath) ? `${options === null || options === void 0 ? void 0 : options.baseCachePath}/.afj` : `${(0, os_1.homedir)()}/.afj/cache`;
        this.tempPath = `${(_a = options === null || options === void 0 ? void 0 : options.baseTempPath) !== null && _a !== void 0 ? _a : (0, os_1.tmpdir)()}/.afj`;
    }
    async exists(path) {
        try {
            await access(path);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async createDirectory(path) {
        await mkdir((0, path_1.dirname)(path), { recursive: true });
    }
    async copyFile(sourcePath, destinationPath) {
        await copyFile(sourcePath, destinationPath);
    }
    async write(path, data) {
        // Make sure parent directories exist
        await mkdir((0, path_1.dirname)(path), { recursive: true });
        return writeFile(path, data, { encoding: 'utf-8' });
    }
    async read(path) {
        return readFile(path, { encoding: 'utf-8' });
    }
    async delete(path) {
        await rm(path, { recursive: true, force: true });
    }
    async downloadToFile(url, path, options) {
        const httpMethod = url.startsWith('https') ? https_1.default : http_1.default;
        // Make sure parent directories exist
        await mkdir((0, path_1.dirname)(path), { recursive: true });
        const file = fs_1.default.createWriteStream(path);
        const hash = options.verifyHash ? (0, crypto_1.createHash)('sha256') : undefined;
        return new Promise((resolve, reject) => {
            httpMethod
                .get(url, (response) => {
                // check if response is success
                if (response.statusCode !== 200) {
                    reject(`Unable to download file from url: ${url}. Response status was ${response.statusCode}`);
                }
                hash && response.pipe(hash);
                response.pipe(file);
                file.on('finish', async () => {
                    var _a;
                    file.close();
                    if (hash && ((_a = options.verifyHash) === null || _a === void 0 ? void 0 : _a.hash)) {
                        hash.end();
                        const digest = hash.digest();
                        if (digest.compare(options.verifyHash.hash) !== 0) {
                            await fs_1.default.promises.unlink(path);
                            reject(new core_1.CredoError(`Hash of downloaded file does not match expected hash. Expected: ${options.verifyHash.hash}, Actual: ${core_1.TypedArrayEncoder.toUtf8String(digest)})}`));
                        }
                    }
                    resolve();
                });
            })
                .on('error', async (error) => {
                // Handle errors
                await unlink(path); // Delete the file async. (But we don't check the result)
                reject(`Unable to download file from url: ${url}. ${error.message}`);
            });
        });
    }
}
exports.NodeFileSystem = NodeFileSystem;
//# sourceMappingURL=NodeFileSystem.js.map