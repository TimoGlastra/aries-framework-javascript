import type { V1ProofProtocol } from '../V1ProofProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1PresentationProblemReportMessage } from '../messages/V1PresentationProblemReportMessage';
export declare class V1PresentationProblemReportHandler implements MessageHandler {
    private proofProtocol;
    supportedMessages: (typeof V1PresentationProblemReportMessage)[];
    constructor(proofProtocol: V1ProofProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1PresentationProblemReportHandler>): Promise<void>;
}
