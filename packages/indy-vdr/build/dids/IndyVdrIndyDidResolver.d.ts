import type { AgentContext, DidResolutionResult, DidResolver } from '@credo-ts/core';
export declare class IndyVdrIndyDidResolver implements DidResolver {
    readonly supportedMethods: string[];
    readonly allowsCaching = true;
    readonly allowsLocalDidRecord = true;
    resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult>;
}
