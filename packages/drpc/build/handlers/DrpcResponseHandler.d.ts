import type { DrpcService } from '../services/DrpcService';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { DrpcResponseMessage } from '../messages';
export declare class DrpcResponseHandler implements MessageHandler {
    private drpcMessageService;
    supportedMessages: (typeof DrpcResponseMessage)[];
    constructor(drpcMessageService: DrpcService);
    handle(messageContext: MessageHandlerInboundMessage<DrpcResponseHandler>): Promise<void>;
}
