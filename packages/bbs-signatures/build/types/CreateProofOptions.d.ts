import type { DocumentLoader, ProofPurpose, JsonObject } from '@credo-ts/core';
/**
 * Options for creating a proof
 */
export interface CreateProofOptions {
    /**
     * Document to create the proof for
     */
    readonly document: JsonObject;
    /**
     * The proof purpose to specify for the generated proof
     */
    readonly purpose: ProofPurpose;
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
    /**
     * Indicates whether to compact the resulting proof
     */
    readonly compactProof: boolean;
}
