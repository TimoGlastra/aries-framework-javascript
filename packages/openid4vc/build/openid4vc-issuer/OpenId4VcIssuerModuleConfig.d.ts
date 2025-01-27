import type { OpenId4VciCredentialRequestToCredentialMapper, OpenId4VciGetVerificationSessionForIssuanceSessionAuthorization } from './OpenId4VcIssuerServiceOptions';
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
    /**
     * The time after which a cNonce will expire.
     *
     * @default 60 (1 minute)
     */
    cNonceExpiresInSeconds?: number;
    /**
     * The time after which a statefull credential offer not bound to a subject expires. Once the offer has been bound
     * to a subject the access token expiration takes effect. This is to prevent long-lived `pre-authorized_code` and
     * `issuer_state` values.
     *
     * @default 180 (3 minutes)
     */
    statefullCredentialOfferExpirationInSeconds?: number;
    /**
     * The time after which an authorization code will expire.
     *
     * @default 60 (1 minute)
     */
    authorizationCodeExpiresInSeconds?: number;
    /**
     * The time after which an access token will expire.
     *
     * @default 180 (3 minutes)
     */
    accessTokenExpiresInSeconds?: number;
    /**
     * Whether DPoP is required for all issuance sessions. This value can be overridden when creating
     * a credential offer. If dpop is not required, but used by a client in the first request to credo,
     * DPoP will be required going forward.
     *
     * @default false
     */
    dpopRequired?: boolean;
    /**
     * Whether to allow dynamic issuance sessions based on a credential request.
     *
     * This requires an external authorization server which issues access tokens without
     * a `pre-authorized_code` or `issuer_state` parameter.
     *
     * Credo only support statefull crednetial offer sessions (pre-auth or presentation during issuance)
     *
     * @default false
     */
    allowDynamicIssuanceSessions?: boolean;
    /**
     * A function mapping a credential request to the credential to be issued.
     */
    credentialRequestToCredentialMapper: OpenId4VciCredentialRequestToCredentialMapper;
    /**
     * Callback to get a verification session that needs to be fulfilled for the authorization of
     * of a credential issuance session. Once the verification session has been completed the user can
     * retrieve an authorization code and access token and retrieve the credential(s).
     *
     * Required if presentation during issuance flow is used
     */
    getVerificationSessionForIssuanceSessionAuthorization?: OpenId4VciGetVerificationSessionForIssuanceSessionAuthorization;
    /**
     * Custom the paths used for endpoints
     */
    endpoints?: {
        /**
         * @default /nonce
         */
        nonce?: string;
        /**
         * @default /challenge
         */
        authorizationChallenge?: string;
        /**
         * @default /offers
         */
        credentialOffer?: string;
        /**
         * @default /credential
         */
        credential?: string;
        /**
         * @default /token
         */
        accessToken?: string;
        /**
         * @default /jwks
         */
        jwks: string;
    };
}
export declare class OpenId4VcIssuerModuleConfig {
    private options;
    readonly router: Router;
    /**
     * Callback to get a verification session that needs to be fulfilled for the authorization of
     * of a credential issuance session. Once the verification session has been completed the user can
     * retrieve an authorization code and access token and retrieve the credential(s).
     *
     * Required if presentation during issuance flow is used
     */
    getVerificationSessionForIssuanceSessionAuthorization?: OpenId4VciGetVerificationSessionForIssuanceSessionAuthorization;
    constructor(options: OpenId4VcIssuerModuleConfigOptions);
    get baseUrl(): string;
    /**
     * A function mapping a credential request to the credential to be issued.
     */
    get credentialRequestToCredentialMapper(): OpenId4VciCredentialRequestToCredentialMapper;
    /**
     * The time after which a cNone will expire.
     *
     * @default 60 (1 minute)
     */
    get cNonceExpiresInSeconds(): number;
    /**
     * The time after which a statefull credential offer not bound to a subject expires. Once the offer has been bound
     * to a subject the access token expiration takes effect. This is to prevent long-lived `pre-authorized_code` and
     * `issuer_state` values.
     *
     * @default 360 (5 minutes)
     */
    get statefullCredentialOfferExpirationInSeconds(): number;
    /**
     * The time after which a cNonce will expire.
     *
     * @default 60 (1 minute)
     */
    get authorizationCodeExpiresInSeconds(): number;
    /**
     * The time after which an access token will expire.
     *
     * @default 360 (5 minutes)
     */
    get accessTokenExpiresInSeconds(): number;
    /**
     * Whether DPoP is required for all issuance sessions. This value can be overridden when creating
     * a credential offer. If dpop is not required, but used by a client in the first request to credo,
     * DPoP will be required going forward.
     *
     * @default false
     */
    get dpopRequired(): boolean;
    /**
     * Whether to allow dynamic issuance sessions based on a credential request.
     *
     * This requires an external authorization server which issues access tokens without
     * a `pre-authorized_code` or `issuer_state` parameter.
     *
     * Credo only supports statefull crednetial offer sessions (pre-auth or presentation during issuance)
     *
     * @default false
     */
    get allowDynamicIssuanceSessions(): boolean;
    /**
     * @default /nonce
     */
    get nonceEndpointPath(): string;
    /**
     * @default /challenge
     */
    get authorizationChallengeEndpointPath(): string;
    /**
     * @default /offers
     */
    get credentialOfferEndpointPath(): string;
    /**
     * @default /credential
     */
    get credentialEndpointPath(): string;
    /**
     * @default /token
     */
    get accessTokenEndpointPath(): string;
    /**
     * @default /jwks
     */
    get jwksEndpointPath(): string;
}
