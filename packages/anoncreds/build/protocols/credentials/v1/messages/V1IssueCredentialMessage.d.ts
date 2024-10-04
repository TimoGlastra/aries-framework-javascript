import type { AnonCredsCredential } from '../../../../models';
import { Attachment, AgentMessage } from '@credo-ts/core';
export declare const INDY_CREDENTIAL_ATTACHMENT_ID = "libindy-cred-0";
export interface V1IssueCredentialMessageOptions {
    id?: string;
    comment?: string;
    credentialAttachments: Attachment[];
    attachments?: Attachment[];
}
export declare class V1IssueCredentialMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1IssueCredentialMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    comment?: string;
    credentialAttachments: Attachment[];
    get indyCredential(): AnonCredsCredential | null;
    getCredentialAttachmentById(id: string): Attachment | undefined;
}
