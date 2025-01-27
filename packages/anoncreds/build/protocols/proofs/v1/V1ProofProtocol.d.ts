import type { LegacyIndyProofFormatService } from '../../../formats';
import type { ProofProtocol, DependencyManager, FeatureRegistry, AgentContext, ProofProtocolOptions, InboundMessageContext, AgentMessage, ProblemReportMessage, GetProofFormatDataReturn, ProofFormat } from '@credo-ts/core';
import { BaseProofProtocol, ProofExchangeRecord } from '@credo-ts/core';
import { V1PresentationAckMessage, V1PresentationMessage, V1ProposePresentationMessage, V1RequestPresentationMessage } from './messages';
export interface V1ProofProtocolConfig {
    indyProofFormat: LegacyIndyProofFormatService;
}
export declare class V1ProofProtocol extends BaseProofProtocol implements ProofProtocol<[LegacyIndyProofFormatService]> {
    private indyProofFormat;
    constructor({ indyProofFormat }: V1ProofProtocolConfig);
    /**
     * The version of the present proof protocol this protocol supports
     */
    readonly version: "v1";
    /**
     * Registers the protocol implementation (handlers, feature registry) on the agent.
     */
    register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void;
    createProposal(agentContext: AgentContext, { proofFormats, connectionRecord, comment, parentThreadId, autoAcceptProof, }: ProofProtocolOptions.CreateProofProposalOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<V1ProposePresentationMessage>>;
    processProposal(messageContext: InboundMessageContext<V1ProposePresentationMessage>): Promise<ProofExchangeRecord>;
    acceptProposal(agentContext: AgentContext, { proofRecord, proofFormats, comment, autoAcceptProof, }: ProofProtocolOptions.AcceptProofProposalOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<V1RequestPresentationMessage>>;
    negotiateProposal(agentContext: AgentContext, { proofFormats, proofRecord, comment, autoAcceptProof, }: ProofProtocolOptions.NegotiateProofProposalOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<AgentMessage>>;
    createRequest(agentContext: AgentContext, { proofFormats, connectionRecord, comment, parentThreadId, autoAcceptProof, }: ProofProtocolOptions.CreateProofRequestOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<AgentMessage>>;
    processRequest(messageContext: InboundMessageContext<V1RequestPresentationMessage>): Promise<ProofExchangeRecord>;
    negotiateRequest(agentContext: AgentContext, { proofFormats, proofRecord, comment, autoAcceptProof, }: ProofProtocolOptions.NegotiateProofRequestOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<AgentMessage>>;
    acceptRequest(agentContext: AgentContext, { proofRecord, proofFormats, autoAcceptProof, comment, }: ProofProtocolOptions.AcceptProofRequestOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<AgentMessage>>;
    getCredentialsForRequest(agentContext: AgentContext, { proofRecord, proofFormats }: ProofProtocolOptions.GetCredentialsForRequestOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.GetCredentialsForRequestReturn<[LegacyIndyProofFormatService]>>;
    selectCredentialsForRequest(agentContext: AgentContext, { proofRecord, proofFormats, }: ProofProtocolOptions.SelectCredentialsForRequestOptions<[LegacyIndyProofFormatService]>): Promise<ProofProtocolOptions.SelectCredentialsForRequestReturn<[LegacyIndyProofFormatService]>>;
    processPresentation(messageContext: InboundMessageContext<V1PresentationMessage>): Promise<ProofExchangeRecord>;
    acceptPresentation(agentContext: AgentContext, { proofRecord }: ProofProtocolOptions.AcceptPresentationOptions): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<V1PresentationAckMessage>>;
    processAck(messageContext: InboundMessageContext<V1PresentationAckMessage>): Promise<ProofExchangeRecord>;
    createProblemReport(_agentContext: AgentContext, { proofRecord, description }: ProofProtocolOptions.CreateProofProblemReportOptions): Promise<ProofProtocolOptions.ProofProtocolMsgReturnType<ProblemReportMessage>>;
    shouldAutoRespondToProposal(agentContext: AgentContext, options: {
        proofRecord: ProofExchangeRecord;
        proposalMessage: V1ProposePresentationMessage;
    }): Promise<boolean>;
    shouldAutoRespondToRequest(agentContext: AgentContext, options: {
        proofRecord: ProofExchangeRecord;
        requestMessage: V1RequestPresentationMessage;
    }): Promise<boolean>;
    shouldAutoRespondToPresentation(agentContext: AgentContext, options: {
        proofRecord: ProofExchangeRecord;
        presentationMessage: V1PresentationMessage;
    }): Promise<boolean>;
    findProposalMessage(agentContext: AgentContext, proofRecordId: string): Promise<V1ProposePresentationMessage | null>;
    findRequestMessage(agentContext: AgentContext, proofRecordId: string): Promise<V1RequestPresentationMessage | null>;
    findPresentationMessage(agentContext: AgentContext, proofRecordId: string): Promise<V1PresentationMessage | null>;
    getFormatData(agentContext: AgentContext, proofRecordId: string): Promise<GetProofFormatDataReturn<ProofFormat[]>>;
    private assertOnlyIndyFormat;
}
