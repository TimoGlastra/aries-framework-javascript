import { AgentContext } from '@credo-ts/core';
import { CheqdCreateResourceOptions } from './dids';
export declare class CheqdApi {
    private agentContext;
    constructor(agentContext: AgentContext);
    createResource(did: string, options: CheqdCreateResourceOptions): Promise<{
        resourceMetadata: {};
        resourceRegistrationMetadata: {};
        resourceState: {
            state: string;
            reason: string;
            resourceId?: undefined;
            resource?: undefined;
        };
    } | {
        resourceMetadata: {};
        resourceRegistrationMetadata: {};
        resourceState: {
            state: string;
            resourceId: string;
            resource: import("@cheqd/ts-proto/cheqd/resource/v2").MsgCreateResourcePayload;
            reason?: undefined;
        };
    }>;
    resolveResource(resourceUrl: string): Promise<{
        error: string;
        message: string;
        resource?: undefined;
        resourceMetadata?: undefined;
        resourceResolutionMetadata?: undefined;
    } | {
        resource: any;
        resourceMetadata: import("@cheqd/ts-proto/cheqd/resource/v2").Metadata;
        resourceResolutionMetadata: {};
        error?: undefined;
        message?: undefined;
    }>;
}
