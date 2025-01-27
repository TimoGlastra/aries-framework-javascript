import type { OpenId4VcJwtIssuer, OpenId4VcSiopVerifiedAuthorizationRequest, OpenId4VcJwtIssuerFederation } from '../shared';
import type { DifPexCredentialsForRequest, DifPexInputDescriptorToCredentials, DifPresentationExchangeDefinition, EncodedX509Certificate, DcqlQueryResult, DcqlCredentialsForRequest } from '@credo-ts/core';
export interface OpenId4VcSiopResolvedAuthorizationRequest {
    /**
     * Parameters related to DIF Presentation Exchange. Only defined when
     * the request included
     */
    presentationExchange?: {
        definition: DifPresentationExchangeDefinition;
        credentialsForRequest: DifPexCredentialsForRequest;
    };
    dcql?: {
        queryResult: DcqlQueryResult;
    };
    /**
     * The verified authorization request.
     */
    authorizationRequest: OpenId4VcSiopVerifiedAuthorizationRequest;
}
export interface OpenId4VcSiopAcceptAuthorizationRequestOptions {
    /**
     * Parameters related to DIF Presentation Exchange. MUST be present when the resolved
     * authorization request included a `presentationExchange` parameter.
     */
    presentationExchange?: {
        credentials: DifPexInputDescriptorToCredentials;
    };
    /**
     * Parameters related to Dcql. MUST be present when the resolved
     * authorization request included a `dcql` parameter.
     */
    dcql?: {
        credentials: DcqlCredentialsForRequest;
    };
    /**
     * The issuer of the ID Token.
     *
     * REQUIRED when presentation exchange is not used.
     *
     * In case presentation exchange is used, and `openIdTokenIssuer` is not provided, the issuer of the ID Token
     * will be extracted from the signer of the first verifiable presentation.
     */
    openIdTokenIssuer?: Exclude<OpenId4VcJwtIssuer, OpenId4VcJwtIssuerFederation>;
    /**
     * The verified authorization request.
     */
    authorizationRequest: OpenId4VcSiopVerifiedAuthorizationRequest;
}
export interface OpenId4VcSiopResolveAuthorizationRequestOptions {
    federation?: {
        /**
         * The entity IDs of the trusted issuers.
         */
        trustedEntityIds?: string[];
    };
    trustedCertificates?: EncodedX509Certificate[];
}
export interface OpenId4VcSiopGetOpenIdProviderOptions {
    federation?: {
        /**
         * The entity IDs of the trusted issuers.
         */
        trustedEntityIds?: string[];
    };
    trustedCertificates?: EncodedX509Certificate[];
}
export interface OpenId4VcSiopResolveTrustChainsOptions {
    entityId: string;
    trustAnchorEntityIds: [string, ...string[]];
}
export interface OpenId4VcSiopFetchEntityConfigurationOptions {
    entityId: string;
}
