import type { AnonCredsPresentationPreviewAttribute, AnonCredsPresentationPreviewPredicate } from '../formats/AnonCredsProofFormat';
import type { AnonCredsNonRevokedInterval, AnonCredsProofRequest } from '../models';
export declare function createRequestFromPreview({ name, version, nonce, attributes, predicates, nonRevokedInterval, }: {
    name: string;
    version: string;
    nonce: string;
    attributes: AnonCredsPresentationPreviewAttribute[];
    predicates: AnonCredsPresentationPreviewPredicate[];
    nonRevokedInterval?: AnonCredsNonRevokedInterval;
}): AnonCredsProofRequest;
