import { AgentMessage } from '@credo-ts/core';
export interface DrpcRequestObject {
    jsonrpc: string;
    method: string;
    params?: any[] | object;
    id: string | number | null;
}
export type DrpcRequest = DrpcRequestObject | DrpcRequestObject[];
export declare class DrpcRequestMessage extends AgentMessage {
    constructor(options: {
        request: DrpcRequest;
    });
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    request: DrpcRequest;
}
