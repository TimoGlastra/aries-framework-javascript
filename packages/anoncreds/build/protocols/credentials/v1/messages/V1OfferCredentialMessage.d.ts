import type { AnonCredsCredentialOffer } from '../../../../models';
import { Attachment, AgentMessage } from '@credo-ts/core';
import { V1CredentialPreview } from './V1CredentialPreview';
export declare const INDY_CREDENTIAL_OFFER_ATTACHMENT_ID = "libindy-cred-offer-0";
export interface V1OfferCredentialMessageOptions {
    id?: string;
    comment?: string;
    offerAttachments: Attachment[];
    credentialPreview: V1CredentialPreview;
    attachments?: Attachment[];
}
/**
 * Message part of Issue Credential Protocol used to continue or initiate credential exchange by issuer.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#offer-credential
 */
export declare class V1OfferCredentialMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1OfferCredentialMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    comment?: string;
    credentialPreview: V1CredentialPreview;
    offerAttachments: Attachment[];
    get indyCredentialOffer(): AnonCredsCredentialOffer | null;
    getOfferAttachmentById(id: string): Attachment | undefined;
}
