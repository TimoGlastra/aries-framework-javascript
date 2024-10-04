import type { DrpcService } from '../services/DrpcService';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { DrpcRequestMessage } from '../messages';
export declare class DrpcRequestHandler implements MessageHandler {
    private drpcMessageService;
    supportedMessages: (typeof DrpcRequestMessage)[];
    constructor(drpcMessageService: DrpcService);
    handle(messageContext: MessageHandlerInboundMessage<DrpcRequestHandler>): Promise<void>;
}
