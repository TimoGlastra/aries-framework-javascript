import { AgentMessage } from '@credo-ts/core';
import { V1PresentationPreview } from '../models/V1PresentationPreview';
export interface V1ProposePresentationMessageOptions {
    id?: string;
    comment?: string;
    presentationProposal: V1PresentationPreview;
}
/**
 * Propose Presentation Message part of Present Proof Protocol used to initiate presentation exchange by holder.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#propose-presentation
 */
export declare class V1ProposePresentationMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1ProposePresentationMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    /**
     * Provides some human readable information about the proposed presentation.
     */
    comment?: string;
    /**
     * Represents the presentation example that prover wants to provide.
     */
    presentationProposal: V1PresentationPreview;
}
