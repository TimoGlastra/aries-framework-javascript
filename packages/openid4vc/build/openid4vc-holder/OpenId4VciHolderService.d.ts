import type { OpenId4VciAcceptCredentialOfferOptions, OpenId4VciAuthCodeFlowOptions, OpenId4VciCredentialResponse, OpenId4VciNotificationEvent, OpenId4VciResolvedAuthorizationRequest, OpenId4VciResolvedAuthorizationRequestWithCode, OpenId4VciResolvedCredentialOffer, OpenId4VciTokenRequestOptions } from './OpenId4VciHolderServiceOptions';
import type { AgentContext } from '@credo-ts/core';
import { Jwk, JwsService, Logger, W3cCredentialService } from '@credo-ts/core';
import { CreateJwtCallback, DPoPJwtIssuerWithContext } from '@sphereon/oid4vc-common';
import { OpenId4VciNotificationMetadata } from './OpenId4VciHolderServiceOptions';
import { JwtIssuerWithContext } from '@sphereon/did-auth-siop';
export declare class OpenId4VciHolderService {
    private logger;
    private w3cCredentialService;
    private jwsService;
    constructor(logger: Logger, w3cCredentialService: W3cCredentialService, jwsService: JwsService);
    resolveCredentialOffer(agentContext: AgentContext, credentialOffer: string): Promise<OpenId4VciResolvedCredentialOffer>;
    private getAuthDetailsFromOfferedCredential;
    resolveAuthorizationRequest(agentContext: AgentContext, resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer, authCodeFlowOptions: OpenId4VciAuthCodeFlowOptions): Promise<OpenId4VciResolvedAuthorizationRequest>;
    sendNotification(options: {
        notificationMetadata: OpenId4VciNotificationMetadata;
        notificationEvent: OpenId4VciNotificationEvent;
        accessToken: string;
    }): Promise<void>;
    private getCreateDpopOptions;
    requestAccessToken(agentContext: AgentContext, options: OpenId4VciTokenRequestOptions): Promise<{
        dpop?: {
            jwk: Jwk;
            nonce: string | undefined;
        } | undefined;
        access_token: string;
        scope?: string;
        token_type?: string;
        expires_in?: number;
        c_nonce?: string;
        c_nonce_expires_in?: number;
        authorization_pending?: boolean;
        interval?: number;
    }>;
    acceptCredentialOffer(agentContext: AgentContext, options: {
        resolvedCredentialOffer: OpenId4VciResolvedCredentialOffer;
        acceptCredentialOfferOptions: OpenId4VciAcceptCredentialOfferOptions;
        resolvedAuthorizationRequestWithCode?: OpenId4VciResolvedAuthorizationRequestWithCode;
        accessToken?: string;
        cNonce?: string;
        dpop?: {
            jwk: Jwk;
            nonce?: string;
        };
        clientId?: string;
        additionalCredentialRequestPayloadClaims?: Record<string, unknown>;
        additionalProofOfPossessionPayloadClaims?: Record<string, unknown>;
        customFormat?: string;
        popCallback?: (...args: any[]) => any;
        getCreateJwtCallback?: (agentContext: AgentContext) => CreateJwtCallback<DPoPJwtIssuerWithContext | JwtIssuerWithContext>;
        customBody?: Record<string, unknown>;
        skipSdJwtVcValidation?: boolean;
    }): Promise<string[] | OpenId4VciCredentialResponse[]>;
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
    private proofOfPossessionSignCallback;
}
