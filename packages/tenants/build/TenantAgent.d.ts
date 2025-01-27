import type { AgentContext, DefaultAgentModules, ModulesMap } from '@credo-ts/core';
import { BaseAgent } from '@credo-ts/core';
export declare class TenantAgent<AgentModules extends ModulesMap = DefaultAgentModules> extends BaseAgent<AgentModules> {
    private sessionHasEnded;
    constructor(agentContext: AgentContext);
    initialize(): Promise<void>;
    endSession(): Promise<void>;
}
