"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRegistryService = void 0;
const core_1 = require("@credo-ts/core");
const AnonCredsModuleConfig_1 = require("../../AnonCredsModuleConfig");
const error_1 = require("../../error");
/**
 * @internal
 * The AnonCreds registry service manages multiple {@link AnonCredsRegistry} instances
 * and returns the correct registry based on a given identifier
 */
let AnonCredsRegistryService = class AnonCredsRegistryService {
    getRegistryForIdentifier(agentContext, identifier) {
        const registries = agentContext.dependencyManager.resolve(AnonCredsModuleConfig_1.AnonCredsModuleConfig).registries;
        // TODO: should we check if multiple are registered?
        const registry = registries.find((registry) => registry.supportedIdentifier.test(identifier));
        if (!registry) {
            throw new error_1.AnonCredsError(`No AnonCredsRegistry registered for identifier '${identifier}'`);
        }
        return registry;
    }
};
exports.AnonCredsRegistryService = AnonCredsRegistryService;
exports.AnonCredsRegistryService = AnonCredsRegistryService = __decorate([
    (0, core_1.injectable)()
], AnonCredsRegistryService);
//# sourceMappingURL=AnonCredsRegistryService.js.map