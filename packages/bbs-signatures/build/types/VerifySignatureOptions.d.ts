import type { VerificationMethod, JsonObject, Proof, DocumentLoader } from '@credo-ts/core';
/**
 * Options for verifying a signature
 */
export interface VerifySignatureOptions {
    /**
     * Document to verify
     */
    readonly document: JsonObject;
    /**
     * Array of statements to verify
     */
    readonly verifyData: Uint8Array[];
    /**
     * Verification method to verify the signature against
     */
    readonly verificationMethod: VerificationMethod;
    /**
     * Proof to verify
     */
    readonly proof: Proof;
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
}
