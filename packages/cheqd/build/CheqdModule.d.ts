import type { CheqdModuleConfigOptions } from './CheqdModuleConfig';
import type { AgentContext, DependencyManager, Module } from '@credo-ts/core';
import { CheqdApi } from './CheqdApi';
import { CheqdModuleConfig } from './CheqdModuleConfig';
export declare class CheqdModule implements Module {
    readonly config: CheqdModuleConfig;
    readonly api: typeof CheqdApi;
    constructor(config: CheqdModuleConfigOptions);
    register(dependencyManager: DependencyManager): void;
    initialize(agentContext: AgentContext): Promise<void>;
}
