import type { DidResolutionResult, ParsedDid, DidResolver, AgentContext } from '@credo-ts/core';
export declare class IndyVdrSovDidResolver implements DidResolver {
    readonly supportedMethods: string[];
    readonly allowsCaching = true;
    resolve(agentContext: AgentContext, did: string, parsed: ParsedDid): Promise<DidResolutionResult>;
    private getPublicDid;
    private getEndpointsForDid;
}
