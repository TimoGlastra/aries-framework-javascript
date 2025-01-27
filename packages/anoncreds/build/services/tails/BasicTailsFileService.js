"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicTailsFileService = void 0;
const core_1 = require("@credo-ts/core");
class BasicTailsFileService {
    constructor(options) {
        this.tailsDirectoryPath = options === null || options === void 0 ? void 0 : options.tailsDirectoryPath;
    }
    async getTailsBasePath(agentContext) {
        var _a;
        const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        const basePath = `${(_a = this.tailsDirectoryPath) !== null && _a !== void 0 ? _a : fileSystem.cachePath}/anoncreds/tails`;
        if (!(await fileSystem.exists(basePath))) {
            await fileSystem.createDirectory(`${basePath}/file`);
        }
        return basePath;
    }
    async uploadTailsFile(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options) {
        throw new core_1.CredoError('BasicTailsFileService only supports tails file downloading');
    }
    async getTailsFile(agentContext, options) {
        const { revocationRegistryDefinition } = options;
        const { tailsLocation, tailsHash } = revocationRegistryDefinition.value;
        const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        try {
            agentContext.config.logger.debug(`Checking to see if tails file for URL ${revocationRegistryDefinition.value.tailsLocation} has been stored in the FileSystem`);
            // hash is used as file identifier
            const tailsExists = await this.tailsFileExists(agentContext, tailsHash);
            const tailsFilePath = await this.getTailsFilePath(agentContext, tailsHash);
            agentContext.config.logger.debug(`Tails file for ${tailsLocation} ${tailsExists ? 'is stored' : 'is not stored'} at ${tailsFilePath}`);
            if (!tailsExists) {
                agentContext.config.logger.debug(`Retrieving tails file from URL ${tailsLocation}`);
                // download file and verify hash
                await fileSystem.downloadToFile(tailsLocation, tailsFilePath, {
                    verifyHash: {
                        algorithm: 'sha256',
                        hash: core_1.TypedArrayEncoder.fromBase58(tailsHash),
                    },
                });
                agentContext.config.logger.debug(`Saved tails file to FileSystem at path ${tailsFilePath}`);
            }
            return { tailsFilePath };
        }
        catch (error) {
            agentContext.config.logger.error(`Error while retrieving tails file from URL ${tailsLocation}`, {
                error,
            });
            throw error;
        }
    }
    async getTailsFilePath(agentContext, tailsHash) {
        return `${await this.getTailsBasePath(agentContext)}/${tailsHash}`;
    }
    async tailsFileExists(agentContext, tailsHash) {
        const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        const tailsFilePath = await this.getTailsFilePath(agentContext, tailsHash);
        return await fileSystem.exists(tailsFilePath);
    }
}
exports.BasicTailsFileService = BasicTailsFileService;
//# sourceMappingURL=BasicTailsFileService.js.map