"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X509Module = void 0;
const AgentConfig_1 = require("../../agent/AgentConfig");
const X509Api_1 = require("./X509Api");
const X509ModuleConfig_1 = require("./X509ModuleConfig");
const X509Service_1 = require("./X509Service");
/**
 * @public
 */
class X509Module {
    constructor(options) {
        this.api = X509Api_1.X509Api;
        this.config = new X509ModuleConfig_1.X509ModuleConfig(options);
    }
    /**
     * Registers the dependencies of the sd-jwt-vc module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(AgentConfig_1.AgentConfig)
            .logger.warn("The 'X509' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Register config
        dependencyManager.registerInstance(X509ModuleConfig_1.X509ModuleConfig, this.config);
        // Services
        dependencyManager.registerSingleton(X509Service_1.X509Service);
    }
}
exports.X509Module = X509Module;
//# sourceMappingURL=X509Module.js.map