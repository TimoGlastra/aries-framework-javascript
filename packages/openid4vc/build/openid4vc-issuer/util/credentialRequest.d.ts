import type { OpenId4VciCredentialRequest } from '../../shared';
/**
 * Extract the 'nonce' parameter from the JWT payload of the credential request.
 */
export declare function getCNonceFromCredentialRequest(credentialRequest: OpenId4VciCredentialRequest): string;
