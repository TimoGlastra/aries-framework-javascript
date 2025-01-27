import type { OpenId4VciAcceptCredentialOfferOptions, OpenId4VciAuthCodeFlowOptions, OpenId4VciCredentialResponse, OpenId4VciDpopRequestOptions, OpenId4VciNotificationEvent, OpenId4VciResolvedAuthorizationRequest, OpenId4VciResolvedCredentialOffer, OpenId4VciRetrieveAuthorizationCodeUsingPresentationOptions, OpenId4VciTokenRequestOptions } from './OpenId4VciHolderServiceOptions';
import type { OpenId4VciMetadata } from '../shared';
import type { AgentContext, JwaSignatureAlgorithm } from '@credo-ts/core';
import { IssuerMetadataResult } from '@animo-id/oid4vci';
import { Jwk, JwsService, Logger, W3cCredentialService } from '@credo-ts/core';
export declare class OpenId4VciHolderService {
    private logger;
    private w3cCredentialService;
    private jwsService;
    constructor(logger: Logger, w3cCredentialService: W3cCredentialService, jwsService: JwsService);
    resolveIssuerMetadata(agentContext: AgentContext, credentialIssuer: string): Promise<OpenId4VciMetadata>;
    resolveCredentialOffer(agentContext: AgentContext, credentialOffer: string): Promise<OpenId4VciResolvedCredentialOffer>;
    resolveAuthorizationRequest(agentContext: AgentContext, resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, authCodeFlowOptions: OpenId4VciAuthCodeFlowOptions): Promise<OpenId4VciResolvedAuthorizationRequest>;
    sendNotification(agentContext: AgentContext, options: {
        metadata: IssuerMetadataResult;
        notificationId: string;
        notificationEvent: OpenId4VciNotificationEvent;
        accessToken: string;
        dpop?: {
            jwk: Jwk;
            alg: JwaSignatureAlgorithm;
            nonce?: string;
        };
    }): Promise<void>;
    private getDpopOptions;
    retrieveAuthorizationCodeUsingPresentation(agentContext: AgentContext, options: OpenId4VciRetrieveAuthorizationCodeUsingPresentationOptions): Promise<{
        authorizationCode: string;
    }>;
    requestAccessToken(agentContext: AgentContext, options: OpenId4VciTokenRequestOptions): Promise<{
        dpop: {
            alg: JwaSignatureAlgorithm;
            jwk: Jwk;
            nonce?: string;
            signer?: import("@animo-id/oauth2").JwtSignerJwk | undefined;
        } | undefined;
        authorizationServer: string;
        accessTokenResponse: import("@animo-id/oauth2").AccessTokenResponse;
    }>;
    acceptCredentialOffer(agentContext: AgentContext, options: {
        resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer;
        acceptCredentialOfferOptions: OpenId4VciAcceptCredentialOfferOptions;
        accessToken: string;
        cNonce?: string;
        dpop?: OpenId4VciDpopRequestOptions;
        clientId?: string;
    }): Promise<{
        credentials: OpenId4VciCredentialResponse[];
        dpop: {
            nonce: string | undefined;
            jwk: Jwk;
            alg: JwaSignatureAlgorithm;
        } | undefined;
        cNonce: string | undefined;
    }>;
    /**
     * Get the options for the credential request. Internally this will resolve the proof of possession
     * requirements, and based on that it will call the proofOfPossessionVerificationMethodResolver to
     * allow the caller to select the correct verification method based on the requirements for the proof
     * of possession.
     */
    private getCredentialRequestOptions;
    /**
     * Get the requirements for creating the proof of possession. Based on the allowed
     * credential formats, the allowed proof of possession signature algorithms, and the
     * credential type, this method will select the best credential format and signature
     * algorithm to use, based on the order of preference.
     */
    private getProofOfPossessionRequirements;
    private handleCredentialResponse;
    private getClient;
    private getOauth2Client;
}
