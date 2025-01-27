import type { ActionMenuService } from '../services';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { MenuMessage } from '../messages';
/**
 * @internal
 */
export declare class MenuMessageHandler implements MessageHandler {
    private actionMenuService;
    supportedMessages: (typeof MenuMessage)[];
    constructor(actionMenuService: ActionMenuService);
    handle(inboundMessage: MessageHandlerInboundMessage<MenuMessageHandler>): Promise<void>;
}
