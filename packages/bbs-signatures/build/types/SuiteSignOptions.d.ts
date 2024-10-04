import type { JsonObject, DocumentLoader } from '@credo-ts/core';
/**
 * Options for signing using a signature suite
 */
export interface SuiteSignOptions {
    /**
     * Input document to sign
     */
    readonly document: JsonObject;
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
    /**
     * The array of statements to sign
     */
    readonly verifyData: readonly Uint8Array[];
    /**
     * The proof
     */
    readonly proof: JsonObject;
}
