"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegisteredModuleByInstance = getRegisteredModuleByInstance;
exports.getRegisteredModuleByName = getRegisteredModuleByName;
exports.getApiForModuleByName = getApiForModuleByName;
function getRegisteredModuleByInstance(agentContext, moduleType) {
    const module = Object.values(agentContext.dependencyManager.registeredModules).find((module) => module instanceof moduleType);
    return module;
}
function getRegisteredModuleByName(agentContext, constructorName) {
    const module = Object.values(agentContext.dependencyManager.registeredModules).find((module) => module.constructor.name === constructorName);
    return module;
}
function getApiForModuleByName(agentContext, constructorName) {
    const module = getRegisteredModuleByName(agentContext, constructorName);
    if (!module || !module.api)
        return undefined;
    return agentContext.dependencyManager.resolve(module.api);
}
//# sourceMappingURL=utils.js.map