import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1ProposeCredentialMessage } from '../messages';
export declare class V1ProposeCredentialHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1ProposeCredentialMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1ProposeCredentialHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptProposal;
}
