import type { AnonCredsRequestedAttributeOptions } from './AnonCredsRequestedAttribute';
import type { AnonCredsRequestedPredicateOptions } from './AnonCredsRequestedPredicate';
import { AnonCredsRequestedAttribute } from './AnonCredsRequestedAttribute';
import { AnonCredsRequestedPredicate } from './AnonCredsRequestedPredicate';
import { AnonCredsRevocationInterval } from './AnonCredsRevocationInterval';
export interface AnonCredsProofRequestOptions {
    name: string;
    version: string;
    nonce: string;
    nonRevoked?: AnonCredsRevocationInterval;
    ver?: '1.0' | '2.0';
    requestedAttributes?: Record<string, AnonCredsRequestedAttributeOptions>;
    requestedPredicates?: Record<string, AnonCredsRequestedPredicateOptions>;
}
/**
 * Proof Request for AnonCreds based proof format
 */
export declare class AnonCredsProofRequest {
    constructor(options: AnonCredsProofRequestOptions);
    name: string;
    version: string;
    nonce: string;
    requestedAttributes: Map<string, AnonCredsRequestedAttribute>;
    requestedPredicates: Map<string, AnonCredsRequestedPredicate>;
    nonRevoked?: AnonCredsRevocationInterval;
    ver?: '1.0' | '2.0';
}
