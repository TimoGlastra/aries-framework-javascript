/**
 * @packageDocumentation
 * Hello
 */

/// <reference types="node" />

import type { Agent } from '@aries-framework/core';
import type { AgentDependencies } from '@aries-framework/core';
import type { Express as Express_2 } from 'express';
import type { InboundTransport } from '@aries-framework/core';
import type { Server } from 'http';
import { Server as Server_2 } from 'ws';

/**
 * @public
 */
export declare const agentDependencies: AgentDependencies;

/**
 * HttpInboundTransport implements the InboundTransport interface for receiving DIDComm messages over HTTP.
 *
 * The transport should be registered through the agent using the `registerInboundTransport` method. Make sure
 * to register the transport before calling `agent.initialize()`.
 *
 * @public
 *
 * @example
 * ```typescript
 * const httpInboundTransport = new HttpInboundTransport({ port: 3000 ))
 * agent.registerInboundTransport(httpInboundTransport)
 * ```
 */
export declare class HttpInboundTransport implements InboundTransport {
    readonly app: Express_2;
    private port;
    private _server?;
    get server(): Server | undefined;
    constructor({ app, port }: {
        app?: Express_2;
        port: number;
    });
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
}

/**
 * WsInboundTransport implements the InboundTransport interface for receiving DIDComm messages over WebSocket.
 *
 * The transport should be registered through the agent using the `registerInboundTransport` method. Make sure
 * to register the transport before calling `agent.initialize()`.
 *
 * @public
 *
 * @example
 * ```typescript
 * const wsInboundTransport = new WsInboundTransport({ port: 3000 ))
 * agent.registerInboundTransport(wsInboundTransport)
 * ```
 */
export declare class WsInboundTransport implements InboundTransport {
    private socketServer;
    private logger;
    private socketIds;
    constructor({ server, port }: {
        server: Server_2;
        port?: undefined;
    } | {
        server?: undefined;
        port: number;
    });
    start(agent: Agent): Promise<void>;
    stop(): Promise<void>;
    private listenOnWebSocketMessages;
}

export { }
