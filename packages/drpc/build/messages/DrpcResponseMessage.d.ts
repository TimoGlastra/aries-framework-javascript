import type { DrpcErrorCode } from '../models';
import { AgentMessage } from '@credo-ts/core';
export type DrpcResponse = DrpcResponseObject | (DrpcResponseObject | Record<string, never>)[] | Record<string, never>;
export interface DrpcResponseError {
    code: DrpcErrorCode;
    message: string;
    data?: any;
}
export interface DrpcResponseObject {
    jsonrpc: string;
    result?: any;
    error?: DrpcResponseError;
    id: string | number | null;
}
export declare class DrpcResponseMessage extends AgentMessage {
    constructor(options: {
        response: DrpcResponse;
        threadId: string;
    });
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    response: DrpcResponse;
}
