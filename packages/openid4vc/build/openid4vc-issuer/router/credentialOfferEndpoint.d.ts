import type { Router } from 'express';
export interface OpenId4VciCredentialOfferEndpointConfig {
    /**
     * The path at which the credential offer should should be made available. Note that it will be
     * hosted at a subpath to take into account multiple tenants and issuers.
     *
     * @default /offers
     */
    endpointPath: string;
}
export declare function configureCredentialOfferEndpoint(router: Router, config: OpenId4VciCredentialOfferEndpointConfig): void;
