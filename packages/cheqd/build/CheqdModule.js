"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheqdModule = void 0;
const core_1 = require("@credo-ts/core");
const CheqdApi_1 = require("./CheqdApi");
const CheqdModuleConfig_1 = require("./CheqdModuleConfig");
const ledger_1 = require("./ledger");
class CheqdModule {
    constructor(config) {
        this.api = CheqdApi_1.CheqdApi;
        this.config = new CheqdModuleConfig_1.CheqdModuleConfig(config);
    }
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@credo-ts/cheqd' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Register config
        dependencyManager.registerInstance(CheqdModuleConfig_1.CheqdModuleConfig, this.config);
        dependencyManager.registerSingleton(ledger_1.CheqdLedgerService);
        // Cheqd module needs Buffer to be available globally
        // If it is not available yet, we overwrite it with the
        // Buffer implementation from Credo
        global.Buffer = global.Buffer || core_1.Buffer;
    }
    async initialize(agentContext) {
        // not required
        const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
        await cheqdLedgerService.connect();
    }
}
exports.CheqdModule = CheqdModule;
//# sourceMappingURL=CheqdModule.js.map