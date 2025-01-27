import type { AnonCredsModuleConfigOptions } from './AnonCredsModuleConfig';
import type { DependencyManager, Module } from '@credo-ts/core';
import { AnonCredsApi } from './AnonCredsApi';
import { AnonCredsModuleConfig } from './AnonCredsModuleConfig';
import { updateAnonCredsModuleV0_3_1ToV0_4 } from './updates/0.3.1-0.4';
import { updateAnonCredsModuleV0_4ToV0_5 } from './updates/0.4-0.5';
/**
 * @public
 */
export declare class AnonCredsModule implements Module {
    readonly config: AnonCredsModuleConfig;
    api: typeof AnonCredsApi;
    constructor(config: AnonCredsModuleConfigOptions);
    register(dependencyManager: DependencyManager): void;
    updates: ({
        fromVersion: "0.3.1";
        toVersion: "0.4";
        doUpdate: typeof updateAnonCredsModuleV0_3_1ToV0_4;
    } | {
        fromVersion: "0.4";
        toVersion: "0.5";
        doUpdate: typeof updateAnonCredsModuleV0_4ToV0_5;
    })[];
}
