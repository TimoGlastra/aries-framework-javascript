import type { ActionMenuService } from '../services';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { MenuRequestMessage } from '../messages';
/**
 * @internal
 */
export declare class MenuRequestMessageHandler implements MessageHandler {
    private actionMenuService;
    supportedMessages: (typeof MenuRequestMessage)[];
    constructor(actionMenuService: ActionMenuService);
    handle(inboundMessage: MessageHandlerInboundMessage<MenuRequestMessageHandler>): Promise<void>;
}
