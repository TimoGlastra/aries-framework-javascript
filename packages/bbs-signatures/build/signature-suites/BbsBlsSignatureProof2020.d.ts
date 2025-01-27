import type { DeriveProofOptions, VerifyProofOptions, CreateVerifyDataOptions, CanonizeOptions } from '../types';
import type { VerifyProofResult } from '../types/VerifyProofResult';
import type { JsonObject, DocumentLoader, Proof } from '@credo-ts/core';
declare const LinkedDataProof: any;
export declare class BbsBlsSignatureProof2020 extends LinkedDataProof {
    constructor({ useNativeCanonize, key, LDKeyClass }?: Record<string, unknown>);
    /**
     * Derive a proof from a proof and reveal document
     *
     * @param options {object} options for deriving a proof.
     *
     * @returns {Promise<object>} Resolves with the derived proof object.
     */
    deriveProof(options: DeriveProofOptions): Promise<Record<string, unknown>>;
    /**
     * @param options {object} options for verifying the proof.
     *
     * @returns {Promise<{object}>} Resolves with the verification result.
     */
    verifyProof(options: VerifyProofOptions): Promise<VerifyProofResult>;
    canonize(input: JsonObject, options: CanonizeOptions): Promise<string>;
    canonizeProof(proof: JsonObject, options: CanonizeOptions): Promise<string>;
    /**
     * @param document {CreateVerifyDataOptions} options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyData(options: CreateVerifyDataOptions): Promise<string[]>;
    /**
     * @param proof to canonicalize
     * @param options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyProofData(proof: JsonObject, { documentLoader }: {
        documentLoader?: DocumentLoader;
    }): Promise<string[]>;
    /**
     * @param document to canonicalize
     * @param options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyDocumentData(document: JsonObject, { documentLoader }: {
        documentLoader?: DocumentLoader;
    }): Promise<string[]>;
    getVerificationMethod(options: {
        proof: Proof;
        documentLoader?: DocumentLoader;
    }): Promise<any>;
    static proofType: string[];
    static supportedDerivedProofType: string[];
}
export {};
