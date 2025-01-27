import type { V1CredentialProtocol } from '../V1CredentialProtocol';
import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core';
import { V1IssueCredentialMessage } from '../messages';
export declare class V1IssueCredentialHandler implements MessageHandler {
    private credentialProtocol;
    supportedMessages: (typeof V1IssueCredentialMessage)[];
    constructor(credentialProtocol: V1CredentialProtocol);
    handle(messageContext: MessageHandlerInboundMessage<V1IssueCredentialHandler>): Promise<import("@credo-ts/core").OutboundMessageContext<import("@credo-ts/core").AgentMessage> | undefined>;
    private acceptCredential;
}
