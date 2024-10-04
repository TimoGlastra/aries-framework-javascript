import type { OpenId4VciCredentialRequestToCredentialMapper } from '../OpenId4VcIssuerServiceOptions';
import type { Router } from 'express';
export interface OpenId4VciCredentialEndpointConfig {
    /**
     * The path at which the credential endpoint should be made available. Note that it will be
     * hosted at a subpath to take into account multiple tenants and issuers.
     *
     * @default /credential
     */
    endpointPath: string;
    /**
     * A function mapping a credential request to the credential to be issued.
     */
    credentialRequestToCredentialMapper: OpenId4VciCredentialRequestToCredentialMapper;
}
export declare function configureCredentialEndpoint(router: Router, config: OpenId4VciCredentialEndpointConfig): void;
