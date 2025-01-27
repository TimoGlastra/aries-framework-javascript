import type { LegacyIndyProofRequest } from '../../../../formats';
import { Attachment, AgentMessage } from '@credo-ts/core';
export interface V1RequestPresentationMessageOptions {
    id?: string;
    comment?: string;
    requestAttachments: Attachment[];
}
export declare const INDY_PROOF_REQUEST_ATTACHMENT_ID = "libindy-request-presentation-0";
/**
 * Request Presentation Message part of Present Proof Protocol used to initiate request from verifier to prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#request-presentation
 */
export declare class V1RequestPresentationMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1RequestPresentationMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    /**
     *  Provides some human readable information about this request for a presentation.
     */
    comment?: string;
    /**
     * An array of attachments defining the acceptable formats for the presentation.
     */
    requestAttachments: Attachment[];
    get indyProofRequest(): LegacyIndyProofRequest | null;
    getRequestAttachmentById(id: string): Attachment | undefined;
}
