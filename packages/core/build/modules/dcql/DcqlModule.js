"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcqlModule = void 0;
const AgentConfig_1 = require("../../agent/AgentConfig");
const DcqlService_1 = require("./DcqlService");
/**
 * @public
 */
class DcqlModule {
    /**
     * Registers the dependencies of the presentation-exchange module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(AgentConfig_1.AgentConfig)
            .logger.warn("The 'DcqlModule' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // service
        dependencyManager.registerSingleton(DcqlService_1.DcqlService);
    }
}
exports.DcqlModule = DcqlModule;
//# sourceMappingURL=DcqlModule.js.map