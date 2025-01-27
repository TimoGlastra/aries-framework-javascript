import type { Router } from 'express';
export interface OpenId4VcSiopAuthorizationRequestEndpointConfig {
    /**
     * The path at which the authorization request should be made available. Note that it will be
     * hosted at a subpath to take into account multiple tenants and verifiers.
     *
     * @default /authorization-requests
     */
    endpointPath: string;
}
export declare function configureAuthorizationRequestEndpoint(router: Router, config: OpenId4VcSiopAuthorizationRequestEndpointConfig): void;
