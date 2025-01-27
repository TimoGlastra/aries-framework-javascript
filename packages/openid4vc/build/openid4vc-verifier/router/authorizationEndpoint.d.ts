import type { Router } from 'express';
export interface OpenId4VcSiopAuthorizationEndpointConfig {
    /**
     * The path at which the authorization endpoint should be made available. Note that it will be
     * hosted at a subpath to take into account multiple tenants and verifiers.
     *
     * @default /authorize
     */
    endpointPath: string;
}
export declare function configureAuthorizationEndpoint(router: Router, config: OpenId4VcSiopAuthorizationEndpointConfig): void;
