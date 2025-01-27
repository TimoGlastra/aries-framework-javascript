import type { LegacyIndyCredentialRequest } from '../../../../formats';
import { Attachment, AgentMessage } from '@credo-ts/core';
export declare const INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID = "libindy-cred-request-0";
export interface V1RequestCredentialMessageOptions {
    id?: string;
    comment?: string;
    requestAttachments: Attachment[];
    attachments?: Attachment[];
}
export declare class V1RequestCredentialMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1RequestCredentialMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    comment?: string;
    requestAttachments: Attachment[];
    get indyCredentialRequest(): LegacyIndyCredentialRequest | null;
    getRequestAttachmentById(id: string): Attachment | undefined;
}
