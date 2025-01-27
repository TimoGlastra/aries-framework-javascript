import type { Proof, JsonObject, ProofPurpose, DocumentLoader } from '@credo-ts/core';
/**
 * Options for verifying a proof
 */
export interface VerifyProofOptions {
    /**
     * The proof
     */
    readonly proof: Proof;
    /**
     * The document
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
}
