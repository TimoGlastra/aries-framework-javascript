import type { DocumentLoader } from '@credo-ts/core';
/**
 * Options for canonizing a document
 */
export interface CanonizeOptions {
    /**
     * Optional custom document loader
     */
    documentLoader?: DocumentLoader;
    /**
     * Indicates whether to skip expansion during canonization
     */
    readonly skipExpansion?: boolean;
}
