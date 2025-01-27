import type { OpenId4VciResolvedCredentialOffer, OpenId4VciAuthCodeFlowOptions, OpenId4VciTokenRequestOptions as OpenId4VciRequestTokenOptions, OpenId4VciCredentialRequestOptions as OpenId4VciRequestCredentialOptions, OpenId4VciSendNotificationOptions, OpenId4VciRequestTokenResponse, OpenId4VciRetrieveAuthorizationCodeUsingPresentationOptions } from './OpenId4VciHolderServiceOptions';
import type { OpenId4VcSiopAcceptAuthorizationRequestOptions, OpenId4VcSiopResolveAuthorizationRequestOptions, OpenId4VcSiopResolveTrustChainsOptions } from './OpenId4vcSiopHolderServiceOptions';
import { AgentContext, DifPresentationExchangeService, DifPexCredentialsForRequest, DcqlQueryResult, DcqlService } from '@credo-ts/core';
import { OpenId4VciMetadata } from '../shared';
import { OpenId4VciHolderService } from './OpenId4VciHolderService';
import { OpenId4VcSiopHolderService } from './OpenId4vcSiopHolderService';
/**
 * @public
 */
export declare class OpenId4VcHolderApi {
    private agentContext;
    private openId4VciHolderService;
    private openId4VcSiopHolderService;
    private difPresentationExchangeService;
    private dcqlService;
    constructor(agentContext: AgentContext, openId4VciHolderService: OpenId4VciHolderService, openId4VcSiopHolderService: OpenId4VcSiopHolderService, difPresentationExchangeService: DifPresentationExchangeService, dcqlService: DcqlService);
    /**
     * Resolves the authentication request given as URI or JWT to a unified format, and
     * verifies the validity of the request.
     *
     * The resolved request can be accepted with the @see acceptSiopAuthorizationRequest.
     *
     * If the authorization request uses OpenID4VP and included presentation definitions,
     * a `presentationExchange` property will be defined with credentials that satisfy the
     * incoming request. When `presentationExchange` is present, you MUST supply `presentationExchange`
     * when calling `acceptSiopAuthorizationRequest` as well.
     *
     * @param requestJwtOrUri JWT or an SIOPv2 request URI
     * @returns the resolved and verified authentication request.
     */
    resolveSiopAuthorizationRequest(requestJwtOrUri: string, options?: OpenId4VcSiopResolveAuthorizationRequestOptions): Promise<import("./OpenId4vcSiopHolderServiceOptions").OpenId4VcSiopResolvedAuthorizationRequest>;
    /**
     * Accepts the authentication request after it has been resolved and verified with {@link resolveSiopAuthorizationRequest}.
     *
     * If the resolved authorization request included a `presentationExchange` property, you MUST supply `presentationExchange`
     * in the `options` parameter.
     *
     * If no `presentationExchange` property is present, you MUST supply `openIdTokenIssuer` in the `options` parameter.
     */
    acceptSiopAuthorizationRequest(options: OpenId4VcSiopAcceptAuthorizationRequestOptions): Promise<{
        readonly ok: false;
        readonly serverResponse: {
            readonly status: number;
            readonly body: string | Record<string, unknown> | null;
        };
        readonly submittedResponse: import("@sphereon/did-auth-siop").AuthorizationResponsePayload;
        readonly redirectUri?: undefined;
        readonly presentationDuringIssuanceSession?: undefined;
    } | {
        readonly ok: true;
        readonly serverResponse: {
            readonly status: number;
            readonly body: Record<string, unknown>;
        };
        readonly submittedResponse: import("@sphereon/did-auth-siop").AuthorizationResponsePayload;
        readonly redirectUri: string | undefined;
        readonly presentationDuringIssuanceSession: string | undefined;
    }>;
    /**
     * Automatically select credentials from available credentials for a presentation exchange request. Can be called after calling
     * @see resolveSiopAuthorizationRequest.
     */
    selectCredentialsForPresentationExchangeRequest(credentialsForRequest: DifPexCredentialsForRequest): import("@credo-ts/core").DifPexInputDescriptorToCredentials;
    /**
     * Automatically select credentials from available credentials for a dcql request. Can be called after calling
     * @see resolveSiopAuthorizationRequest.
     */
    selectCredentialsForDcqlRequest(dcqlQueryResult: DcqlQueryResult): import("@credo-ts/core").DcqlCredentialsForRequest;
    resolveIssuerMetadata(credentialIssuer: string): Promise<OpenId4VciMetadata>;
    /**
     * Resolves a credential offer given as credential offer URL, or issuance initiation URL,
     * into a unified format with metadata.
     *
     * @param credentialOffer the credential offer to resolve
     * @returns The uniform credential offer payload, the issuer metadata, protocol version, and the offered credentials with metadata.
     */
    resolveCredentialOffer(credentialOffer: string): Promise<OpenId4VciResolvedCredentialOffer>;
    /**
     * This function is to be used to receive an credential in OpenID4VCI using the Authorization Code Flow.
     *
     * Not to be confused with the {@link resolveSiopAuthorizationRequest}, which is only used for SIOP requests.
     *
     * It will generate an authorization session based on the provided options.
     *
     * There are two possible flows:
     * - Oauth2Recirect: an authorization request URI is returend which can be used to obtain the authorization code.
     *   This needs to be done manually (e.g. by opening a browser window)
     * - PresentationDuringIssuance: an openid4vp presentation request needs to be handled. A oid4vpRequestUri is returned
     *   which can be parsed using `resolveSiopAuthorizationRequest`. After the presentation session has been completed,
     *   the resulting `presentationDuringIssuanceSession` can be used to obtain an authorization code
     *
     * Authorization to request credentials can be requested via authorization_details or scopes.
     * This function automatically generates the authorization_details for all offered credentials.
     * If scopes are provided, the provided scopes are sent alongside the authorization_details.
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param authCodeFlowOptions
     * @returns The authorization request URI alongside the code verifier and original @param authCodeFlowOptions
     */
    resolveIssuanceAuthorizationRequest(resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, authCodeFlowOptions: OpenId4VciAuthCodeFlowOptions): Promise<import("./OpenId4VciHolderServiceOptions").OpenId4VciResolvedAuthorizationRequest>;
    /**
     * Retrieve an authorization code using an `presentationDuringIssuanceSession`.
     *
     * The authorization code can be exchanged for an `accessToken` @see requestToken
     */
    retrieveAuthorizationCodeUsingPresentation(options: OpenId4VciRetrieveAuthorizationCodeUsingPresentationOptions): Promise<{
        authorizationCode: string;
    }>;
    /**
     * Requests the token to be used for credential requests.
     */
    requestToken(options: OpenId4VciRequestTokenOptions): Promise<OpenId4VciRequestTokenResponse>;
    /**
     * Request a set of credentials from the credential isser.
     * Can be used with both the pre-authorized code flow and the authorization code flow.
     */
    requestCredentials(options: OpenId4VciRequestCredentialOptions): Promise<{
        credentials: import("./OpenId4VciHolderServiceOptions").OpenId4VciCredentialResponse[];
        dpop: {
            nonce: string | undefined;
            jwk: import("@credo-ts/core").Jwk;
            alg: import("@credo-ts/core").JwaSignatureAlgorithm;
        } | undefined;
        cNonce: string | undefined;
    }>;
    /**
     * Send a notification event to the credential issuer
     */
    sendNotification(options: OpenId4VciSendNotificationOptions): Promise<void>;
    resolveOpenIdFederationChains(options: OpenId4VcSiopResolveTrustChainsOptions): Promise<{
        chain: Awaited<ReturnType<typeof import("@openid-federation/core").fetchEntityStatementChain>>;
        leafEntityConfiguration: Awaited<ReturnType<typeof import("@openid-federation/core").fetchEntityConfiguration>>;
        trustAnchorEntityConfiguration: Awaited<ReturnType<typeof import("@openid-federation/core").fetchEntityConfiguration>>;
    }[]>;
}
