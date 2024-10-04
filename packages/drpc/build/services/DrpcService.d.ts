import type { DrpcRequest, DrpcResponse } from '../messages';
import type { AgentContext, InboundMessageContext, Query, QueryOptions } from '@credo-ts/core';
import { EventEmitter } from '@credo-ts/core';
import { DrpcRequestMessage, DrpcResponseMessage } from '../messages';
import { DrpcRecord, DrpcRepository } from '../repository';
export declare class DrpcService {
    private drpcMessageRepository;
    private eventEmitter;
    constructor(drpcMessageRepository: DrpcRepository, eventEmitter: EventEmitter);
    createRequestMessage(agentContext: AgentContext, request: DrpcRequest, connectionId: string): Promise<{
        requestMessage: DrpcRequestMessage;
        record: DrpcRecord;
    }>;
    createResponseMessage(agentContext: AgentContext, response: DrpcResponse, drpcRecord: DrpcRecord): Promise<{
        responseMessage: DrpcResponseMessage;
        record: DrpcRecord;
    }>;
    createRequestListener(callback: (params: {
        drpcMessageRecord: DrpcRecord;
        removeListener: () => void;
    }) => void | Promise<void>): () => void;
    createResponseListener(callback: (params: {
        drpcMessageRecord: DrpcRecord;
        removeListener: () => void;
    }) => void | Promise<void>): () => void;
    receiveResponse(messageContext: InboundMessageContext<DrpcResponseMessage>): Promise<DrpcRecord>;
    receiveRequest(messageContext: InboundMessageContext<DrpcRequestMessage>): Promise<DrpcRecord>;
    private emitStateChangedEvent;
    private updateState;
    findByThreadAndConnectionId(agentContext: AgentContext, connectionId: string, threadId: string): Promise<DrpcRecord | null>;
    findAllByQuery(agentContext: AgentContext, query: Query<DrpcRecord>, queryOptions?: QueryOptions): Promise<DrpcRecord[]>;
    getById(agentContext: AgentContext, drpcMessageRecordId: string): Promise<DrpcRecord>;
    deleteById(agentContext: AgentContext, drpcMessageRecordId: string): Promise<void>;
}
