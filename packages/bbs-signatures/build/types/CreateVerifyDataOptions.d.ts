import type { JsonObject, DocumentLoader } from '@credo-ts/core';
/**
 * Options for creating a proof
 */
export interface CreateVerifyDataOptions {
    /**
     * Document to create the proof for
     */
    readonly document: JsonObject;
    /**
     * The proof
     */
    readonly proof: JsonObject;
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
    /**
     * Indicates whether to compact the proof
     */
    readonly compactProof: boolean;
}
