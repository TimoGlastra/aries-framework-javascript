import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1CredentialAckMessage } from '../messages';
export declare class V1CredentialAckHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1CredentialAckMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1CredentialAckHandler>): Promise<void>;
}
