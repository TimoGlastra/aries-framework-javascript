import type { OpenId4VcIssuanceRequest } from './requestContext';
import type { NextFunction, Response, Router } from 'express';
export interface OpenId4VciAccessTokenEndpointConfig {
    /**
     * The path at which the token endpoint should be made available. Note that it will be
     * hosted at a subpath to take into account multiple tenants and issuers.
     *
     * @default /token
     */
    endpointPath: string;
    /**
     * The maximum amount of time in seconds that the pre-authorized code is valid.
     * @default 360 (5 minutes)
     */
    preAuthorizedCodeExpirationInSeconds: number;
    /**
     * The time after which the cNonce from the access token response will
     * expire.
     *
     * @default 360 (5 minutes)
     */
    cNonceExpiresInSeconds: number;
    /**
     * The time after which the token will expire.
     *
     * @default 360 (5 minutes)
     */
    tokenExpiresInSeconds: number;
}
export declare function configureAccessTokenEndpoint(router: Router, config: OpenId4VciAccessTokenEndpointConfig): void;
export declare function handleTokenRequest(config: OpenId4VciAccessTokenEndpointConfig): (request: OpenId4VcIssuanceRequest, response: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare function verifyTokenRequest(options: {
    preAuthorizedCodeExpirationInSeconds: number;
}): (request: OpenId4VcIssuanceRequest, response: Response, next: NextFunction) => Promise<void>;
