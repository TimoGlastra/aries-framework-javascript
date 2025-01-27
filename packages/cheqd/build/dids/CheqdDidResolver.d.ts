import type { Metadata } from '@cheqd/ts-proto/cheqd/resource/v2';
import type { AgentContext, DidResolutionResult, DidResolver, ParsedDid } from '@credo-ts/core';
export declare class CheqdDidResolver implements DidResolver {
    readonly supportedMethods: string[];
    readonly allowsCaching = true;
    readonly allowsLocalDidRecord = true;
    resolve(agentContext: AgentContext, did: string, parsed: ParsedDid): Promise<DidResolutionResult>;
    resolveResource(agentContext: AgentContext, did: string): Promise<{
        error: string;
        message: string;
        resource?: undefined;
        resourceMetadata?: undefined;
        resourceResolutionMetadata?: undefined;
    } | {
        resource: any;
        resourceMetadata: Metadata;
        resourceResolutionMetadata: {};
        error?: undefined;
        message?: undefined;
    }>;
    private resolveAllDidDocVersions;
    private dereferenceCollectionResources;
    private dereferenceResourceMetadata;
    private resolveDidDoc;
}
