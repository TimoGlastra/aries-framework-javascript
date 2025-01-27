"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrModule = void 0;
const IndyVdrApi_1 = require("./IndyVdrApi");
const IndyVdrModuleConfig_1 = require("./IndyVdrModuleConfig");
const IndyVdrPoolService_1 = require("./pool/IndyVdrPoolService");
/**
 * @public
 * */
class IndyVdrModule {
    constructor(config) {
        this.api = IndyVdrApi_1.IndyVdrApi;
        this.config = new IndyVdrModuleConfig_1.IndyVdrModuleConfig(config);
    }
    register(dependencyManager) {
        // Config
        dependencyManager.registerInstance(IndyVdrModuleConfig_1.IndyVdrModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(IndyVdrPoolService_1.IndyVdrPoolService);
    }
    async initialize(agentContext) {
        const indyVdrPoolService = agentContext.dependencyManager.resolve(IndyVdrPoolService_1.IndyVdrPoolService);
        for (const pool of indyVdrPoolService.pools) {
            if (pool.config.connectOnStartup) {
                await pool.connect();
            }
        }
    }
}
exports.IndyVdrModule = IndyVdrModule;
//# sourceMappingURL=IndyVdrModule.js.map