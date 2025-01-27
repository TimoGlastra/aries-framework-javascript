import type { ActionMenuService } from '../services';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { PerformMessage } from '../messages';
/**
 * @internal
 */
export declare class PerformMessageHandler implements MessageHandler {
    private actionMenuService;
    supportedMessages: (typeof PerformMessage)[];
    constructor(actionMenuService: ActionMenuService);
    handle(inboundMessage: MessageHandlerInboundMessage<PerformMessageHandler>): Promise<void>;
}
