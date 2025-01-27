import { AnonCredsPredicateType } from '../../../../models';
export interface V1PresentationPreviewAttributeOptions {
    name: string;
    credentialDefinitionId?: string;
    mimeType?: string;
    value?: string;
    referent?: string;
}
export declare class V1PresentationPreviewAttribute {
    constructor(options: V1PresentationPreviewAttributeOptions);
    name: string;
    credentialDefinitionId?: string;
    mimeType?: string;
    value?: string;
    referent?: string;
    toJSON(): Record<string, unknown>;
}
export interface V1PresentationPreviewPredicateOptions {
    name: string;
    credentialDefinitionId: string;
    predicate: AnonCredsPredicateType;
    threshold: number;
}
export declare class V1PresentationPreviewPredicate {
    constructor(options: V1PresentationPreviewPredicateOptions);
    name: string;
    credentialDefinitionId: string;
    predicate: AnonCredsPredicateType;
    threshold: number;
    toJSON(): Record<string, unknown>;
}
export interface V1PresentationPreviewOptions {
    attributes?: V1PresentationPreviewAttributeOptions[];
    predicates?: V1PresentationPreviewPredicateOptions[];
}
/**
 * Presentation preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used to construct a preview of the data for the presentation.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md#presentation-preview
 */
export declare class V1PresentationPreview {
    constructor(options: V1PresentationPreviewOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    attributes: V1PresentationPreviewAttribute[];
    predicates: V1PresentationPreviewPredicate[];
    toJSON(): Record<string, unknown>;
}
