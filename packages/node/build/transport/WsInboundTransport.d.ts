import type { Agent, InboundTransport, Logger, TransportSession, EncryptedMessage, AgentContext } from '@credo-ts/core';
import WebSocket, { Server } from 'ws';
export declare class WsInboundTransport implements InboundTransport {
    private socketServer;
    private logger;
    private socketIds;
    constructor({ server, port }: {
        server: Server;
        port?: undefined;
    } | {
        server?: undefined;
        port: number;
    });
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
    private listenOnWebSocketMessages;
}
export declare class WebSocketTransportSession implements TransportSession {
    id: string;
    readonly type = "WebSocket";
    socket: WebSocket;
    private logger;
    constructor(id: string, socket: WebSocket, logger: Logger);
    send(agentContext: AgentContext, encryptedMessage: EncryptedMessage): Promise<void>;
    close(): Promise<void>;
}
