import type { GetNymResponseData, IndyEndpointAttrib } from './didSovUtil';
import type { IndyVdrPool } from '../pool';
import type { AgentContext } from '@credo-ts/core';
import { DidDocument, DidDocumentBuilder, Key } from '@credo-ts/core';
export declare function indyDidDocumentFromDid(did: string, verKeyBase58: string): DidDocumentBuilder;
export declare function createKeyAgreementKey(verkey: string): string;
/**
 * Combine a JSON content with the contents of a DidDocument
 * @param didDoc object containing original DIDDocument
 * @param json object containing extra DIDDoc contents
 *
 * @returns a DidDocument object resulting from the combination of both
 */
export declare function combineDidDocumentWithJson(didDoc: DidDocument, json: Record<string, unknown>): DidDocument;
/**
 * Processes the difference between a base DidDocument and a complete DidDocument
 *
 * Note: it does deep comparison based only on "id" field to determine whether is
 * the same object or is a different one
 *
 * @param extra complete DidDocument
 * @param base base DidDocument
 * @returns diff object
 */
export declare function didDocDiff(extra: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown>;
/**
 * Check whether the did is a self certifying did. If the verkey is abbreviated this method
 * will always return true. Make sure that the verkey you pass in this method belongs to the
 * did passed in
 *
 * @return Boolean indicating whether the did is self certifying
 */
export declare function isSelfCertifiedIndyDid(did: string, verkey: string): boolean;
export declare function indyDidFromNamespaceAndInitialKey(namespace: string, initialKey: Key): {
    did: string;
    id: string;
    verkey: string;
};
/**
 * Fetches the verification key for a given did:indy did and returns the key as a {@link Key} object.
 *
 * @throws {@link CredoError} if the did could not be resolved or the key could not be extracted
 */
export declare function verificationKeyForIndyDid(agentContext: AgentContext, did: string): Promise<Key>;
export declare function getPublicDid(pool: IndyVdrPool, unqualifiedDid: string): Promise<GetNymResponseData>;
export declare function getEndpointsForDid(agentContext: AgentContext, pool: IndyVdrPool, unqualifiedDid: string): Promise<IndyEndpointAttrib | null>;
export declare function buildDidDocument(agentContext: AgentContext, pool: IndyVdrPool, did: string): Promise<DidDocument>;
