import type { OpenId4VcSiopAuthorizationEndpointConfig } from './router/authorizationEndpoint';
import type { OpenId4VcSiopAuthorizationRequestEndpointConfig } from './router/authorizationRequestEndpoint';
import type { Optional } from '@credo-ts/core';
import type { Router } from 'express';
export interface OpenId4VcVerifierModuleConfigOptions {
    /**
     * Base url at which the verifier endpoints will be hosted. All endpoints will be exposed with
     * this path as prefix.
     */
    baseUrl: string;
    /**
     * Express router on which the verifier endpoints will be registered. If
     * no router is provided, a new one will be created.
     *
     * NOTE: you must manually register the router on your express app and
     * expose this on a public url that is reachable when `baseUrl` is called.
     */
    router?: Router;
    endpoints?: {
        authorization?: Optional<OpenId4VcSiopAuthorizationEndpointConfig, 'endpointPath'>;
        authorizationRequest?: Optional<OpenId4VcSiopAuthorizationRequestEndpointConfig, 'endpointPath'>;
    };
}
export declare class OpenId4VcVerifierModuleConfig {
    private options;
    readonly router: Router;
    constructor(options: OpenId4VcVerifierModuleConfigOptions);
    get baseUrl(): string;
    get authorizationRequestEndpoint(): OpenId4VcSiopAuthorizationRequestEndpointConfig;
    get authorizationEndpoint(): OpenId4VcSiopAuthorizationEndpointConfig;
}
