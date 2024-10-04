"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenuModule = void 0;
const core_1 = require("@credo-ts/core");
const ActionMenuApi_1 = require("./ActionMenuApi");
const ActionMenuRole_1 = require("./ActionMenuRole");
const repository_1 = require("./repository");
const services_1 = require("./services");
/**
 * @public
 */
class ActionMenuModule {
    constructor() {
        this.api = ActionMenuApi_1.ActionMenuApi;
    }
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager, featureRegistry) {
        // Services
        dependencyManager.registerSingleton(services_1.ActionMenuService);
        // Repositories
        dependencyManager.registerSingleton(repository_1.ActionMenuRepository);
        // Feature Registry
        featureRegistry.register(new core_1.Protocol({
            id: 'https://didcomm.org/action-menu/1.0',
            roles: [ActionMenuRole_1.ActionMenuRole.Requester, ActionMenuRole_1.ActionMenuRole.Responder],
        }));
    }
}
exports.ActionMenuModule = ActionMenuModule;
//# sourceMappingURL=ActionMenuModule.js.map