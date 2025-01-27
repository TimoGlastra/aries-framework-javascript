import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1RequestCredentialMessage } from '../messages';
export declare class V1RequestCredentialHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1RequestCredentialMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1RequestCredentialHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptRequest;
}
