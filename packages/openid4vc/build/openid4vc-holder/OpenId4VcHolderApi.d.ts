import type { OpenId4VciResolvedCredentialOffer, OpenId4VciResolvedAuthorizationRequest, OpenId4VciAuthCodeFlowOptions, OpenId4VciAcceptCredentialOfferOptions, OpenId4VciTokenRequestOptions as OpenId4VciRequestTokenOptions, OpenId4VciCredentialRequestOptions as OpenId4VciRequestCredentialOptions, OpenId4VciSendNotificationOptions, OpenId4VciRequestTokenResponse } from './OpenId4VciHolderServiceOptions';
import type { OpenId4VcSiopAcceptAuthorizationRequestOptions } from './OpenId4vcSiopHolderServiceOptions';
import { AgentContext } from '@credo-ts/core';
import { OpenId4VciHolderService } from './OpenId4VciHolderService';
import { OpenId4VcSiopHolderService } from './OpenId4vcSiopHolderService';
/**
 * @public
 */
export declare class OpenId4VcHolderApi {
    private agentContext;
    private openId4VciHolderService;
    private openId4VcSiopHolderService;
    constructor(agentContext: AgentContext, openId4VciHolderService: OpenId4VciHolderService, openId4VcSiopHolderService: OpenId4VcSiopHolderService);
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
    resolveSiopAuthorizationRequest(requestJwtOrUri: string): Promise<import("./OpenId4vcSiopHolderServiceOptions").OpenId4VcSiopResolvedAuthorizationRequest>;
    /**
     * Accepts the authentication request after it has been resolved and verified with {@link resolveSiopAuthorizationRequest}.
     *
     * If the resolved authorization request included a `presentationExchange` property, you MUST supply `presentationExchange`
     * in the `options` parameter.
     *
     * If no `presentationExchange` property is present, you MUST supply `openIdTokenIssuer` in the `options` parameter.
     */
    acceptSiopAuthorizationRequest(options: OpenId4VcSiopAcceptAuthorizationRequestOptions): Promise<{
        serverResponse: {
            status: number;
            body: string | Record<string, unknown> | undefined;
        };
        submittedResponse: import("@sphereon/did-auth-siop").AuthorizationResponsePayload;
    }>;
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
     * It will generate the authorization request URI based on the provided options.
     * The authorization request URI is used to obtain the authorization code. Currently this needs to be done manually.
     *
     * Authorization to request credentials can be requested via authorization_details or scopes.
     * This function automatically generates the authorization_details for all offered credentials.
     * If scopes are provided, the provided scopes are sent alongside the authorization_details.
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param authCodeFlowOptions
     * @returns The authorization request URI alongside the code verifier and original @param authCodeFlowOptions
     */
    resolveIssuanceAuthorizationRequest(resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, authCodeFlowOptions: OpenId4VciAuthCodeFlowOptions): Promise<OpenId4VciResolvedAuthorizationRequest>;
    /**
     * Accepts a credential offer using the pre-authorized code flow.
     * @deprecated use @see requestToken and @see requestCredentials instead
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param acceptCredentialOfferOptions
     */
    acceptCredentialOfferUsingPreAuthorizedCode(resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, acceptCredentialOfferOptions: OpenId4VciAcceptCredentialOfferOptions): Promise<(string | import("@credo-ts/core").VerifiableCredential)[]>;
    /**
     * Accepts a credential offer using the authorization code flow.
     * @deprecated use @see requestToken and @see requestCredentials instead
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param resolvedAuthorizationRequest Obtained through @see resolveIssuanceAuthorizationRequest
     * @param code The authorization code obtained via the authorization request URI
     * @param acceptCredentialOfferOptions
     */
    acceptCredentialOfferUsingAuthorizationCode(resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, resolvedAuthorizationRequest: OpenId4VciResolvedAuthorizationRequest, code: string, acceptCredentialOfferOptions: OpenId4VciAcceptCredentialOfferOptions): Promise<(string | import("@credo-ts/core").VerifiableCredential)[]>;
    /**
     * Requests the token to be used for credential requests.
     *
     * @param options.resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param options.userPin The user's PIN
     * @param options.resolvedAuthorizationRequest Obtained through @see resolveIssuanceAuthorizationRequest
     * @param options.code The authorization code obtained via the authorization request URI
     */
    requestToken(options: OpenId4VciRequestTokenOptions): Promise<OpenId4VciRequestTokenResponse>;
    /**
     * Request a credential. Can be used with both the pre-authorized code flow and the authorization code flow.
     *
     * @param options.resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param options.tokenResponse Obtained through @see requestAccessToken
     */
    requestCredentials(options: OpenId4VciRequestCredentialOptions): Promise<string[] | import("./OpenId4VciHolderServiceOptions").OpenId4VciCredentialResponse[]>;
    /**
     * Send a notification event to the credential issuer
     *
     * @param options OpenId4VciSendNotificationOptions
     */
    sendNotification(options: OpenId4VciSendNotificationOptions): Promise<void>;
}
