import { DidDocumentService, DidDocumentBuilder } from '@credo-ts/core';
export type CommEndpointType = 'endpoint' | 'did-communication' | 'DIDComm' | 'DIDCommMessaging';
export interface IndyEndpointAttrib {
    endpoint?: string;
    types?: Array<CommEndpointType>;
    routingKeys?: string[];
    [key: string]: unknown;
}
export interface GetNymResponseData {
    did: string;
    verkey: string;
    role: string;
    alias?: string;
    diddocContent?: string;
}
export declare const FULL_VERKEY_REGEX: RegExp;
/**
 * Check a base58 encoded string against a regex expression to determine if it is a full valid verkey
 * @param verkey Base58 encoded string representation of a verkey
 * @return Boolean indicating if the string is a valid verkey
 */
export declare function isFullVerkey(verkey: string): boolean;
export declare function getFullVerkey(did: string, verkey: string): string;
export declare function sovDidDocumentFromDid(fullDid: string, verkey: string): DidDocumentBuilder;
export declare function endpointsAttribFromServices(services: DidDocumentService[]): IndyEndpointAttrib;
export declare function addServicesFromEndpointsAttrib(builder: DidDocumentBuilder, did: string, endpoints: IndyEndpointAttrib, keyAgreementId: string): void;
