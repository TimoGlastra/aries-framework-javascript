import type { TenantsModuleConfigOptions } from './TenantsModuleConfig';
import type { Constructor, ModulesMap, DependencyManager, Module, EmptyModuleMap } from '@credo-ts/core';
import { TenantsApi } from './TenantsApi';
import { TenantsModuleConfig } from './TenantsModuleConfig';
import { updateTenantsModuleV0_4ToV0_5 } from './updates/0.4-0.5';
export declare class TenantsModule<AgentModules extends ModulesMap = EmptyModuleMap> implements Module {
    readonly config: TenantsModuleConfig;
    readonly api: Constructor<TenantsApi<AgentModules>>;
    constructor(config?: TenantsModuleConfigOptions);
    /**
     * Registers the dependencies of the tenants module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
    updates: {
        fromVersion: "0.4";
        toVersion: "0.5";
        doUpdate: typeof updateTenantsModuleV0_4ToV0_5;
    }[];
}
