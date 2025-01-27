"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdocModule = void 0;
const AgentConfig_1 = require("../../agent/AgentConfig");
const MdocApi_1 = require("./MdocApi");
const MdocService_1 = require("./MdocService");
const repository_1 = require("./repository");
/**
 * @public
 */
class MdocModule {
    constructor() {
        this.api = MdocApi_1.MdocApi;
    }
    /**
     * Registers the dependencies of the mdoc module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(AgentConfig_1.AgentConfig)
            .logger.warn("The 'Mdoc' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Services
        dependencyManager.registerSingleton(MdocService_1.MdocService);
        // Repositories
        dependencyManager.registerSingleton(repository_1.MdocRepository);
    }
}
exports.MdocModule = MdocModule;
//# sourceMappingURL=MdocModule.js.map