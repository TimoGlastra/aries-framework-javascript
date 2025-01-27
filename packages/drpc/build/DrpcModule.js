"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrpcModule = void 0;
const core_1 = require("@credo-ts/core");
const DrpcApi_1 = require("./DrpcApi");
const DrpcRole_1 = require("./models/DrpcRole");
const repository_1 = require("./repository");
const services_1 = require("./services");
class DrpcModule {
    constructor() {
        this.api = DrpcApi_1.DrpcApi;
    }
    /**
     * Registers the dependencies of the drpc message module on the dependency manager.
     */
    register(dependencyManager, featureRegistry) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@credo-ts/drpc' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Services
        dependencyManager.registerSingleton(services_1.DrpcService);
        // Repositories
        dependencyManager.registerSingleton(repository_1.DrpcRepository);
        // Features
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/drpc/1.0',
            roles: [DrpcRole_1.DrpcRole.Client, DrpcRole_1.DrpcRole.Server],
        }));
    }
}
exports.DrpcModule = DrpcModule;
//# sourceMappingURL=DrpcModule.js.map