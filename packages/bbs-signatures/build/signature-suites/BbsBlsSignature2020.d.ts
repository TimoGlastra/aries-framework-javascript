import type { SignatureSuiteOptions, CreateProofOptions, VerifyProofOptions, CanonizeOptions, CreateVerifyDataOptions, SuiteSignOptions, VerifySignatureOptions } from '../types';
import type { VerificationMethod, DocumentLoader, Proof } from '@credo-ts/core';
declare const LinkedDataProof: any;
/**
 * A BBS+ signature suite for use with BLS12-381 key pairs
 */
export declare class BbsBlsSignature2020 extends LinkedDataProof {
    private proof;
    /**
     * Default constructor
     * @param options {SignatureSuiteOptions} options for constructing the signature suite
     */
    constructor(options?: SignatureSuiteOptions);
    ensureSuiteContext({ document }: {
        document: Record<string, unknown>;
    }): void;
    /**
     * @param options {CreateProofOptions} options for creating the proof
     *
     * @returns {Promise<object>} Resolves with the created proof object.
     */
    createProof(options: CreateProofOptions): Promise<Record<string, unknown>>;
    /**
     * @param options {object} options for verifying the proof.
     *
     * @returns {Promise<{object}>} Resolves with the verification result.
     */
    verifyProof(options: VerifyProofOptions): Promise<Record<string, unknown>>;
    canonize(input: Record<string, unknown>, options: CanonizeOptions): Promise<string>;
    canonizeProof(proof: Record<string, unknown>, options: CanonizeOptions): Promise<string>;
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
    createVerifyProofData(proof: Record<string, unknown>, { documentLoader }: {
        documentLoader?: DocumentLoader;
    }): Promise<string[]>;
    /**
     * @param document to canonicalize
     * @param options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyDocumentData(document: Record<string, unknown>, { documentLoader }: {
        documentLoader?: DocumentLoader;
    }): Promise<string[]>;
    /**
     * @param document {object} to be signed.
     * @param proof {object}
     * @param documentLoader {function}
     */
    getVerificationMethod({ proof, documentLoader, }: {
        proof: Proof;
        documentLoader?: DocumentLoader;
    }): Promise<VerificationMethod>;
    /**
     * @param options {SuiteSignOptions} Options for signing.
     *
     * @returns {Promise<{object}>} the proof containing the signature value.
     */
    sign(options: SuiteSignOptions): Promise<Proof>;
    /**
     * @param verifyData {VerifySignatureOptions} Options to verify the signature.
     *
     * @returns {Promise<boolean>}
     */
    verifySignature(options: VerifySignatureOptions): Promise<boolean>;
    static proofType: string[];
}
export {};
