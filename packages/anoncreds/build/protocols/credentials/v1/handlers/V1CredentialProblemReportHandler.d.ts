import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1CredentialProblemReportMessage } from '../messages';
export declare class V1CredentialProblemReportHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1CredentialProblemReportMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1CredentialProblemReportHandler>): Promise<void>;
}
