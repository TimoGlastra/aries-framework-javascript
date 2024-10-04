import type { AskarModuleConfigOptions } from './AskarModuleConfig';
import type { AgentContext, DependencyManager, Module } from '@credo-ts/core';
import { AskarModuleConfig } from './AskarModuleConfig';
export declare class AskarModule implements Module {
    readonly config: AskarModuleConfig;
    constructor(config: AskarModuleConfigOptions);
    register(dependencyManager: DependencyManager): void;
    initialize(agentContext: AgentContext): Promise<void>;
}
