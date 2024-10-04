import type { V1ProofProtocol } from '../V1ProofProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1PresentationMessage } from '../messages';
export declare class V1PresentationHandler implements MessageHandler {
    private proofProtocol;
    supportedMessages: (typeof V1PresentationMessage)[];
    constructor(proofProtocol: V1ProofProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1PresentationHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptPresentation;
}
