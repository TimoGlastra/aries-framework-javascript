import type { AnonCredsProof } from '../../../../models';
import { Attachment, AgentMessage } from '@credo-ts/core';
export declare const INDY_PROOF_ATTACHMENT_ID = "libindy-presentation-0";
export interface V1PresentationMessageOptions {
    id?: string;
    comment?: string;
    presentationAttachments: Attachment[];
    attachments?: Attachment[];
}
/**
 * Presentation Message part of Present Proof Protocol used as a response to a {@link PresentationRequestMessage | Presentation Request Message} from prover to verifier.
 * Contains signed presentations.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation
 */
export declare class V1PresentationMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1PresentationMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    /**
     *  Provides some human readable information about this request for a presentation.
     */
    comment?: string;
    /**
     * An array of attachments containing the presentation in the requested format(s).
     */
    presentationAttachments: Attachment[];
    get indyProof(): AnonCredsProof | null;
    getPresentationAttachmentById(id: string): Attachment | undefined;
}
