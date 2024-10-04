import type { OpenId4VciAccessTokenEndpointConfig, OpenId4VciCredentialEndpointConfig, OpenId4VciCredentialOfferEndpointConfig } from './router';
import type { Optional } from '@credo-ts/core';
import type { Router } from 'express';
export interface OpenId4VcIssuerModuleConfigOptions {
    /**
     * Base url at which the issuer endpoints will be hosted. All endpoints will be exposed with
     * this path as prefix.
     */
    baseUrl: string;
    /**
     * Express router on which the openid4vci endpoints will be registered. If
     * no router is provided, a new one will be created.
     *
     * NOTE: you must manually register the router on your express app and
     * expose this on a public url that is reachable when `baseUrl` is called.
     */
    router?: Router;
    endpoints: {
        credentialOffer?: Optional<OpenId4VciCredentialOfferEndpointConfig, 'endpointPath'>;
        credential: Optional<OpenId4VciCredentialEndpointConfig, 'endpointPath'>;
        accessToken?: Optional<OpenId4VciAccessTokenEndpointConfig, 'cNonceExpiresInSeconds' | 'endpointPath' | 'preAuthorizedCodeExpirationInSeconds' | 'tokenExpiresInSeconds'>;
    };
}
export declare class OpenId4VcIssuerModuleConfig {
    private options;
    readonly router: Router;
    constructor(options: OpenId4VcIssuerModuleConfigOptions);
    get baseUrl(): string;
    /**
     * Get the credential endpoint config, with default values set
     */
    get credentialEndpoint(): OpenId4VciCredentialEndpointConfig;
    /**
     * Get the access token endpoint config, with default values set
     */
    get accessTokenEndpoint(): OpenId4VciAccessTokenEndpointConfig;
    /**
     * Get the hosted credential offer endpoint config, with default values set
     */
    get credentialOfferEndpoint(): OpenId4VciCredentialOfferEndpointConfig;
}
