import type { ActionMenuService } from '../services';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { ActionMenuProblemReportMessage } from '../messages';
/**
 * @internal
 */
export declare class ActionMenuProblemReportHandler implements MessageHandler {
    private actionMenuService;
    supportedMessages: (typeof ActionMenuProblemReportMessage)[];
    constructor(actionMenuService: ActionMenuService);
    handle(messageContext: MessageHandlerInboundMessage<ActionMenuProblemReportHandler>): Promise<void>;
}
