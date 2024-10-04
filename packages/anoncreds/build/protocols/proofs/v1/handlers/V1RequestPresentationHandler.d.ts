import type { V1ProofProtocol } from '../V1ProofProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1RequestPresentationMessage } from '../messages';
export declare class V1RequestPresentationHandler implements MessageHandler {
    private proofProtocol;
    supportedMessages: (typeof V1RequestPresentationMessage)[];
    constructor(proofProtocol: V1ProofProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1RequestPresentationHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptRequest;
}
