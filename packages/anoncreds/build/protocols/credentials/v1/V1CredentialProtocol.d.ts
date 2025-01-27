import type { LegacyIndyCredentialFormatService } from '../../../formats';
import type { AgentContext, AgentMessage, DependencyManager, FeatureRegistry, CredentialProtocolOptions, InboundMessageContext, ProblemReportMessage, ExtractCredentialFormats, CredentialProtocol } from '@credo-ts/core';
import { CredentialExchangeRecord, BaseCredentialProtocol } from '@credo-ts/core';
import { V1ProposeCredentialMessage, V1OfferCredentialMessage, V1RequestCredentialMessage, V1IssueCredentialMessage, V1CredentialAckMessage } from './messages';
export interface V1CredentialProtocolConfig {
    indyCredentialFormat: LegacyIndyCredentialFormatService;
}
export declare class V1CredentialProtocol extends BaseCredentialProtocol<[LegacyIndyCredentialFormatService]> implements CredentialProtocol<[LegacyIndyCredentialFormatService]> {
    private indyCredentialFormat;
    constructor({ indyCredentialFormat }: V1CredentialProtocolConfig);
    /**
     * The version of the issue credential protocol this protocol supports
     */
    readonly version = "v1";
    /**
     * Registers the protocol implementation (handlers, feature registry) on the agent.
     */
    register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void;
    /**
     * Create a {@link ProposeCredentialMessage} not bound to an existing credential exchange.
     * To create a proposal as response to an existing credential exchange, use {@link createProposalAsResponse}.
     *
     * @param options The object containing config options
     * @returns Object containing proposal message and associated credential record
     *
     */
    createProposal(agentContext: AgentContext, { connectionRecord, credentialFormats, comment, autoAcceptCredential, }: CredentialProtocolOptions.CreateCredentialProposalOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<AgentMessage>>;
    /**
     * Process a received {@link ProposeCredentialMessage}. This will not accept the credential proposal
     * or send a credential offer. It will only create a new, or update the existing credential record with
     * the information from the credential proposal message. Use {@link createOfferAsResponse}
     * after calling this method to create a credential offer.
     *
     * @param messageContext The message context containing a credential proposal message
     * @returns credential record associated with the credential proposal message
     *
     */
    processProposal(messageContext: InboundMessageContext<V1ProposeCredentialMessage>): Promise<CredentialExchangeRecord>;
    /**
     * Processing an incoming credential message and create a credential offer as a response
     * @param options The object containing config options
     * @returns Object containing proposal message and associated credential record
     */
    acceptProposal(agentContext: AgentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }: CredentialProtocolOptions.AcceptCredentialProposalOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1OfferCredentialMessage>>;
    /**
     * Negotiate a credential proposal as issuer (by sending a credential offer message) to the connection
     * associated with the credential record.
     *
     * @param options configuration for the offer see {@link NegotiateCredentialProposalOptions}
     * @returns Credential record associated with the credential offer and the corresponding new offer message
     *
     */
    negotiateProposal(agentContext: AgentContext, { credentialFormats, credentialRecord, comment, autoAcceptCredential, }: CredentialProtocolOptions.NegotiateCredentialProposalOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1OfferCredentialMessage>>;
    /**
     * Create a {@link OfferCredentialMessage} not bound to an existing credential exchange.
     * To create an offer as response to an existing credential exchange, use {@link V1CredentialProtocol#createOfferAsResponse}.
     *
     * @param options The options containing config params for creating the credential offer
     * @returns Object containing offer message and associated credential record
     *
     */
    createOffer(agentContext: AgentContext, { credentialFormats, autoAcceptCredential, comment, connectionRecord, }: CredentialProtocolOptions.CreateCredentialOfferOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1OfferCredentialMessage>>;
    /**
     * Process a received {@link OfferCredentialMessage}. This will not accept the credential offer
     * or send a credential request. It will only create a new credential record with
     * the information from the credential offer message. Use {@link createRequest}
     * after calling this method to create a credential request.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential offer message
     *
     */
    processOffer(messageContext: InboundMessageContext<V1OfferCredentialMessage>): Promise<CredentialExchangeRecord>;
    /**
     * Create a {@link RequestCredentialMessage} as response to a received credential offer.
     *
     * @param options configuration to use for the credential request
     * @returns Object containing request message and associated credential record
     *
     */
    acceptOffer(agentContext: AgentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }: CredentialProtocolOptions.AcceptCredentialOfferOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1RequestCredentialMessage>>;
    /**
     * Process a received {@link RequestCredentialMessage}. This will not accept the credential request
     * or send a credential. It will only update the existing credential record with
     * the information from the credential request message. Use {@link createCredential}
     * after calling this method to create a credential.
     *
     * @param messageContext The message context containing a credential request message
     * @returns credential record associated with the credential request message
     *
     */
    negotiateOffer(agentContext: AgentContext, { credentialFormats, credentialRecord, autoAcceptCredential, comment, }: CredentialProtocolOptions.NegotiateCredentialOfferOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<AgentMessage>>;
    /**
     * Starting from a request is not supported in v1 of the issue credential protocol
     * because indy doesn't allow to start from a request
     */
    createRequest(): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1RequestCredentialMessage>>;
    processRequest(messageContext: InboundMessageContext<V1RequestCredentialMessage>): Promise<CredentialExchangeRecord>;
    /**
     * Create a {@link V1IssueCredentialMessage} as response to a received credential request.
     *
     * @returns Object containing issue credential message and associated credential record
     *
     */
    acceptRequest(agentContext: AgentContext, { credentialRecord, credentialFormats, comment, autoAcceptCredential, }: CredentialProtocolOptions.AcceptCredentialRequestOptions<[LegacyIndyCredentialFormatService]>): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1IssueCredentialMessage>>;
    /**
     * Process an incoming {@link V1IssueCredentialMessage}
     *
     * @param messageContext The message context containing a credential acknowledgement message
     * @returns credential record associated with the credential acknowledgement message
     *
     */
    processCredential(messageContext: InboundMessageContext<V1IssueCredentialMessage>): Promise<CredentialExchangeRecord>;
    /**
     * Create a {@link CredentialAckMessage} as response to a received credential.
     *
     * @param credentialRecord The credential record for which to create the credential acknowledgement
     * @returns Object containing credential acknowledgement message and associated credential record
     *
     */
    acceptCredential(agentContext: AgentContext, { credentialRecord }: CredentialProtocolOptions.AcceptCredentialOptions): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<V1CredentialAckMessage>>;
    /**
     * Process a received {@link CredentialAckMessage}.
     *
     * @param messageContext The message context containing a credential acknowledgement message
     * @returns credential record associated with the credential acknowledgement message
     *
     */
    processAck(messageContext: InboundMessageContext<V1CredentialAckMessage>): Promise<CredentialExchangeRecord>;
    /**
     * Create a {@link V1CredentialProblemReportMessage} to be sent.
     *
     * @param message message to send
     * @returns a {@link V1CredentialProblemReportMessage}
     *
     */
    createProblemReport(_agentContext: AgentContext, { credentialRecord, description }: CredentialProtocolOptions.CreateCredentialProblemReportOptions): Promise<CredentialProtocolOptions.CredentialProtocolMsgReturnType<ProblemReportMessage>>;
    shouldAutoRespondToProposal(agentContext: AgentContext, options: {
        credentialRecord: CredentialExchangeRecord;
        proposalMessage: V1ProposeCredentialMessage;
    }): Promise<boolean>;
    shouldAutoRespondToOffer(agentContext: AgentContext, options: {
        credentialRecord: CredentialExchangeRecord;
        offerMessage: V1OfferCredentialMessage;
    }): Promise<boolean>;
    shouldAutoRespondToRequest(agentContext: AgentContext, options: {
        credentialRecord: CredentialExchangeRecord;
        requestMessage: V1RequestCredentialMessage;
    }): Promise<boolean>;
    shouldAutoRespondToCredential(agentContext: AgentContext, options: {
        credentialRecord: CredentialExchangeRecord;
        credentialMessage: V1IssueCredentialMessage;
    }): Promise<boolean>;
    findProposalMessage(agentContext: AgentContext, credentialExchangeId: string): Promise<V1ProposeCredentialMessage | null>;
    findOfferMessage(agentContext: AgentContext, credentialExchangeId: string): Promise<V1OfferCredentialMessage | null>;
    findRequestMessage(agentContext: AgentContext, credentialExchangeId: string): Promise<V1RequestCredentialMessage | null>;
    findCredentialMessage(agentContext: AgentContext, credentialExchangeId: string): Promise<V1IssueCredentialMessage | null>;
    getFormatData(agentContext: AgentContext, credentialExchangeId: string): Promise<CredentialProtocolOptions.GetCredentialFormatDataReturn<ExtractCredentialFormats<[LegacyIndyCredentialFormatService]>>>;
    private rfc0592ProposalFromV1ProposeMessage;
    private assertOnlyIndyFormat;
    getFormatServiceForRecordType(credentialRecordType: string): LegacyIndyCredentialFormatService;
}
