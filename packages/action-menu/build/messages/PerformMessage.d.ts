import { AgentMessage } from '@credo-ts/core';
/**
 * @internal
 */
export interface PerformMessageOptions {
    id?: string;
    name: string;
    params?: Record<string, string>;
    threadId: string;
}
/**
 * @internal
 */
export declare class PerformMessage extends AgentMessage {
    constructor(options: PerformMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    name: string;
    params?: Record<string, string>;
}
