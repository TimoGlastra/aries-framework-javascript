import type { JsonObject, DocumentLoader, Proof } from '@credo-ts/core';
/**
 * Options for creating a proof
 */
export interface DeriveProofOptions {
    /**
     * Document outlining what statements to reveal
     */
    readonly revealDocument: JsonObject;
    /**
     * The document featuring the proof to derive from
     */
    readonly document: JsonObject;
    /**
     * The proof for the document
     */
    readonly proof: Proof;
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
    /**
     * Nonce to include in the derived proof
     */
    readonly nonce?: Uint8Array;
    /**
     * Indicates whether to compact the resulting proof
     */
    readonly skipProofCompaction?: boolean;
}
