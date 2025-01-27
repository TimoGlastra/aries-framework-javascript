import type { V1ProofProtocol } from '../V1ProofProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1PresentationAckMessage } from '../messages';
export declare class V1PresentationAckHandler implements MessageHandler {
    private proofProtocol;
    supportedMessages: (typeof V1PresentationAckMessage)[];
    constructor(proofProtocol: V1ProofProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1PresentationAckHandler>): Promise<void>;
}
