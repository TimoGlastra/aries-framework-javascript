import { AgentMessage } from '@credo-ts/core';
/**
 * @internal
 */
export interface MenuRequestMessageOptions {
    id?: string;
}
/**
 * @internal
 */
export declare class MenuRequestMessage extends AgentMessage {
    constructor(options: MenuRequestMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
