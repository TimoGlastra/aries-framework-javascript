import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1OfferCredentialMessage } from '../messages';
export declare class V1OfferCredentialHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1OfferCredentialMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1OfferCredentialHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptOffer;
}
