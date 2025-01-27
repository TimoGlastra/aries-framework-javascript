import type { LegacyIndyCredentialFormat } from './LegacyIndyCredentialFormat';
import type { CredentialFormatService, AgentContext, CredentialFormatCreateProposalOptions, CredentialFormatCreateProposalReturn, CredentialFormatProcessOptions, CredentialFormatAcceptProposalOptions, CredentialFormatCreateOfferReturn, CredentialFormatCreateOfferOptions, CredentialFormatAcceptOfferOptions, CredentialFormatCreateReturn, CredentialFormatAcceptRequestOptions, CredentialFormatProcessCredentialOptions, CredentialFormatAutoRespondProposalOptions, CredentialFormatAutoRespondOfferOptions, CredentialFormatAutoRespondRequestOptions, CredentialFormatAutoRespondCredentialOptions } from '@credo-ts/core';
import { CredentialFormatSpec, Attachment } from '@credo-ts/core';
export declare class LegacyIndyCredentialFormatService implements CredentialFormatService<LegacyIndyCredentialFormat> {
    /** formatKey is the key used when calling agent.credentials.xxx with credentialFormats.indy */
    readonly formatKey: "indy";
    /**
     * credentialRecordType is the type of record that stores the credential. It is stored in the credential
     * record binding in the credential exchange record.
     */
    readonly credentialRecordType: "w3c";
    /**
     * Create a {@link AttachmentFormats} object dependent on the message type.
     *
     * @param options The object containing all the options for the proposed credential
     * @returns object containing associated attachment, format and optionally the credential preview
     *
     */
    createProposal(agentContext: AgentContext, { credentialFormats, credentialRecord }: CredentialFormatCreateProposalOptions<LegacyIndyCredentialFormat>): Promise<CredentialFormatCreateProposalReturn>;
    processProposal(agentContext: AgentContext, { attachment }: CredentialFormatProcessOptions): Promise<void>;
    acceptProposal(agentContext: AgentContext, { attachmentId, credentialFormats, credentialRecord, proposalAttachment, }: CredentialFormatAcceptProposalOptions<LegacyIndyCredentialFormat>): Promise<CredentialFormatCreateOfferReturn>;
    /**
     * Create a credential attachment format for a credential request.
     *
     * @param options The object containing all the options for the credential offer
     * @returns object containing associated attachment, formats and offersAttach elements
     *
     */
    createOffer(agentContext: AgentContext, { credentialFormats, credentialRecord, attachmentId, }: CredentialFormatCreateOfferOptions<LegacyIndyCredentialFormat>): Promise<CredentialFormatCreateOfferReturn>;
    processOffer(agentContext: AgentContext, { attachment, credentialRecord }: CredentialFormatProcessOptions): Promise<void>;
    acceptOffer(agentContext: AgentContext, { credentialRecord, attachmentId, offerAttachment, credentialFormats, }: CredentialFormatAcceptOfferOptions<LegacyIndyCredentialFormat>): Promise<CredentialFormatCreateReturn>;
    /**
     * Starting from a request is not supported for indy credentials, this method only throws an error.
     */
    createRequest(): Promise<CredentialFormatCreateReturn>;
    /**
     * We don't have any models to validate an indy request object, for now this method does nothing
     */
    processRequest(agentContext: AgentContext, options: CredentialFormatProcessOptions): Promise<void>;
    acceptRequest(agentContext: AgentContext, { credentialRecord, attachmentId, offerAttachment, requestAttachment, }: CredentialFormatAcceptRequestOptions<LegacyIndyCredentialFormat>): Promise<CredentialFormatCreateReturn>;
    /**
     * Processes an incoming credential - retrieve metadata, retrieve payload and store it in the Indy wallet
     * @param options the issue credential message wrapped inside this object
     * @param credentialRecord the credential exchange record for this credential
     */
    processCredential(agentContext: AgentContext, { credentialRecord, attachment }: CredentialFormatProcessCredentialOptions): Promise<void>;
    supportsFormat(format: string): boolean;
    /**
     * Gets the attachment object for a given attachmentId. We need to get out the correct attachmentId for
     * indy and then find the corresponding attachment (if there is one)
     * @param formats the formats object containing the attachmentId
     * @param messageAttachments the attachments containing the payload
     * @returns The Attachment if found or undefined
     *
     */
    getAttachment(formats: CredentialFormatSpec[], messageAttachments: Attachment[]): Attachment | undefined;
    deleteCredentialById(agentContext: AgentContext, credentialRecordId: string): Promise<void>;
    shouldAutoRespondToProposal(agentContext: AgentContext, { offerAttachment, proposalAttachment }: CredentialFormatAutoRespondProposalOptions): Promise<boolean>;
    shouldAutoRespondToOffer(agentContext: AgentContext, { offerAttachment, proposalAttachment }: CredentialFormatAutoRespondOfferOptions): Promise<boolean>;
    shouldAutoRespondToRequest(agentContext: AgentContext, { offerAttachment, requestAttachment }: CredentialFormatAutoRespondRequestOptions): Promise<boolean>;
    shouldAutoRespondToCredential(agentContext: AgentContext, { credentialRecord, requestAttachment, credentialAttachment }: CredentialFormatAutoRespondCredentialOptions): Promise<boolean>;
    private createIndyOffer;
    private assertPreviewAttributesMatchSchemaAttributes;
    /**
     * Get linked attachments for indy format from a proposal message. This allows attachments
     * to be copied across to old style credential records
     *
     * @param options ProposeCredentialOptions object containing (optionally) the linked attachments
     * @return array of linked attachments or undefined if none present
     */
    private getCredentialLinkedAttachments;
    /**
     * Returns an object of type {@link Attachment} for use in credential exchange messages.
     * It looks up the correct format identifier and encodes the data as a base64 attachment.
     *
     * @param data The data to include in the attach object
     * @param id the attach id from the formats component of the message
     */
    getFormatData(data: unknown, id: string): Attachment;
}
