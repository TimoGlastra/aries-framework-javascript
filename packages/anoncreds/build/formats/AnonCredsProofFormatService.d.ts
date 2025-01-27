import type { AnonCredsProofFormat } from './AnonCredsProofFormat';
import type { ProofFormatService, AgentContext, ProofFormatCreateReturn, FormatCreateRequestOptions, ProofFormatCreateProposalOptions, ProofFormatProcessOptions, ProofFormatAcceptProposalOptions, ProofFormatAcceptRequestOptions, ProofFormatProcessPresentationOptions, ProofFormatGetCredentialsForRequestOptions, ProofFormatGetCredentialsForRequestReturn, ProofFormatSelectCredentialsForRequestOptions, ProofFormatSelectCredentialsForRequestReturn, ProofFormatAutoRespondProposalOptions, ProofFormatAutoRespondRequestOptions, ProofFormatAutoRespondPresentationOptions } from '@credo-ts/core';
export declare class AnonCredsProofFormatService implements ProofFormatService<AnonCredsProofFormat> {
    readonly formatKey: "anoncreds";
    createProposal(agentContext: AgentContext, { attachmentId, proofFormats }: ProofFormatCreateProposalOptions<AnonCredsProofFormat>): Promise<ProofFormatCreateReturn>;
    processProposal(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void>;
    acceptProposal(agentContext: AgentContext, { proposalAttachment, attachmentId }: ProofFormatAcceptProposalOptions<AnonCredsProofFormat>): Promise<ProofFormatCreateReturn>;
    createRequest(agentContext: AgentContext, { attachmentId, proofFormats }: FormatCreateRequestOptions<AnonCredsProofFormat>): Promise<ProofFormatCreateReturn>;
    processRequest(agentContext: AgentContext, { attachment }: ProofFormatProcessOptions): Promise<void>;
    acceptRequest(agentContext: AgentContext, { proofFormats, requestAttachment, attachmentId }: ProofFormatAcceptRequestOptions<AnonCredsProofFormat>): Promise<ProofFormatCreateReturn>;
    processPresentation(agentContext: AgentContext, { requestAttachment, attachment }: ProofFormatProcessPresentationOptions): Promise<boolean>;
    getCredentialsForRequest(agentContext: AgentContext, { requestAttachment, proofFormats }: ProofFormatGetCredentialsForRequestOptions<AnonCredsProofFormat>): Promise<ProofFormatGetCredentialsForRequestReturn<AnonCredsProofFormat>>;
    selectCredentialsForRequest(agentContext: AgentContext, { requestAttachment, proofFormats }: ProofFormatSelectCredentialsForRequestOptions<AnonCredsProofFormat>): Promise<ProofFormatSelectCredentialsForRequestReturn<AnonCredsProofFormat>>;
    shouldAutoRespondToProposal(agentContext: AgentContext, { proposalAttachment, requestAttachment }: ProofFormatAutoRespondProposalOptions): Promise<boolean>;
    shouldAutoRespondToRequest(agentContext: AgentContext, { proposalAttachment, requestAttachment }: ProofFormatAutoRespondRequestOptions): Promise<boolean>;
    shouldAutoRespondToPresentation(_agentContext: AgentContext, _options: ProofFormatAutoRespondPresentationOptions): Promise<boolean>;
    supportsFormat(formatIdentifier: string): boolean;
    private _selectCredentialsForRequest;
    /**
     * Build schemas object needed to create and verify proof objects.
     *
     * Creates object with `{ schemaId: AnonCredsSchema }` mapping
     *
     * @param schemaIds List of schema ids
     * @returns Object containing schemas for specified schema ids
     *
     */
    private getSchemas;
    /**
     * Build credential definitions object needed to create and verify proof objects.
     *
     * Creates object with `{ credentialDefinitionId: AnonCredsCredentialDefinition }` mapping
     *
     * @param credentialDefinitionIds List of credential definition ids
     * @returns Object containing credential definitions for specified credential definition ids
     *
     */
    private getCredentialDefinitions;
    /**
     * Create anoncreds proof from a given proof request and requested credential object.
     *
     * @param proofRequest The proof request to create the proof for
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @returns anoncreds proof object
     */
    private createProof;
    /**
     * Returns an object of type {@link Attachment} for use in credential exchange messages.
     * It looks up the correct format identifier and encodes the data as a base64 attachment.
     *
     * @param data The data to include in the attach object
     * @param id the attach id from the formats component of the message
     */
    private getFormatData;
}
