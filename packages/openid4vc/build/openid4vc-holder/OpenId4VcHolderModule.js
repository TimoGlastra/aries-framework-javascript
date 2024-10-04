"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcHolderModule = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VcHolderApi_1 = require("./OpenId4VcHolderApi");
const OpenId4VciHolderService_1 = require("./OpenId4VciHolderService");
const OpenId4vcSiopHolderService_1 = require("./OpenId4vcSiopHolderService");
/**
 * @public @module OpenId4VcHolderModule
 * This module provides the functionality to assume the role of owner in relation to the OpenId4VC specification suite.
 */
class OpenId4VcHolderModule {
    constructor() {
        this.api = OpenId4VcHolderApi_1.OpenId4VcHolderApi;
    }
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager) {
        // Warn about experimental module
        dependencyManager
            .resolve(core_1.AgentConfig)
            .logger.warn("The '@credo-ts/openid4vc' Holder module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages.");
        // Services
        dependencyManager.registerSingleton(OpenId4VciHolderService_1.OpenId4VciHolderService);
        dependencyManager.registerSingleton(OpenId4vcSiopHolderService_1.OpenId4VcSiopHolderService);
    }
}
exports.OpenId4VcHolderModule = OpenId4VcHolderModule;
//# sourceMappingURL=OpenId4VcHolderModule.js.map