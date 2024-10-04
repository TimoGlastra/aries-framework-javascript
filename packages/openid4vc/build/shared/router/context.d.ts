import type { AgentContext, Logger } from '@credo-ts/core';
import type { Response, Request } from 'express';
export interface OpenId4VcRequest<RC extends Record<string, unknown> = Record<string, never>> extends Request {
    requestContext?: RC & OpenId4VcRequestContext;
}
export interface OpenId4VcRequestContext {
    agentContext: AgentContext;
}
export declare function sendErrorResponse(response: Response, logger: Logger, code: number, message: string, error: unknown): Response<any, Record<string, any>>;
export declare function getRequestContext<T extends OpenId4VcRequest<any>>(request: T): NonNullable<T['requestContext']>;
