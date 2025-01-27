import type { InboundTransport, Agent, TransportSession, EncryptedMessage, AgentContext } from '@credo-ts/core';
import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
export declare class HttpInboundTransport implements InboundTransport {
    readonly app: Express;
    private port;
    private path;
    private _server?;
    private processedMessageListenerTimeoutMs;
    get server(): Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | undefined;
    constructor({ app, path, port, processedMessageListenerTimeoutMs, }: {
        app?: Express;
        path?: string;
        port: number;
        processedMessageListenerTimeoutMs?: number;
    });
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
}
export declare class HttpTransportSession implements TransportSession {
    id: string;
    readonly type = "http";
    req: Request;
    res: Response;
    constructor(id: string, req: Request, res: Response);
    close(): Promise<void>;
    send(agentContext: AgentContext, encryptedMessage: EncryptedMessage): Promise<void>;
}
