import type { DrpcRequest, DrpcResponse } from './messages';
import { AgentContext, MessageHandlerRegistry, MessageSender, ConnectionService } from '@credo-ts/core';
import { DrpcService } from './services';
export declare class DrpcApi {
    private drpcMessageService;
    private messageSender;
    private connectionService;
    private agentContext;
    constructor(messageHandlerRegistry: MessageHandlerRegistry, drpcMessageService: DrpcService, messageSender: MessageSender, connectionService: ConnectionService, agentContext: AgentContext);
    /**
     * sends the request object to the connection and returns a function that will resolve to the response
     * @param connectionId the connection to send the request to
     * @param request the request object
     * @returns curried function that waits for the response with an optional timeout in seconds
     */
    sendRequest(connectionId: string, request: DrpcRequest): Promise<() => Promise<DrpcResponse | undefined>>;
    /**
     * Listen for a response that has a thread id matching the provided messageId
     * @param messageId the id to match the response to
     * @param timeoutMs the time in milliseconds to wait for a response
     * @returns the response object
     */
    private recvResponse;
    /**
     * Listen for a request and returns the request object and a function to send the response
     * @param timeoutMs the time in seconds to wait for a request
     * @returns the request object and a function to send the response
     */
    recvRequest(timeoutMs?: number): Promise<{
        request: DrpcRequest;
        sendResponse: (response: DrpcResponse) => Promise<void>;
    } | undefined>;
    /**
     * Sends a drpc response to a connection
     * @param connectionId the connection id to use
     * @param threadId the thread id to respond to
     * @param response the drpc response object to send
     */
    private sendResponse;
    private sendMessage;
    private registerMessageHandlers;
}
