import type { OpenId4VciCredentialOfferPayload } from '../../shared';
import type { RecordTags, TagsBase } from '@credo-ts/core';
import { PkceCodeChallengeMethod } from '@animo-id/oauth2';
import { BaseRecord } from '@credo-ts/core';
import { OpenId4VcIssuanceSessionState } from '../OpenId4VcIssuanceSessionState';
export type OpenId4VcIssuanceSessionRecordTags = RecordTags<OpenId4VcIssuanceSessionRecord>;
export interface OpenId4VcIssuanceSessionAuthorization {
    code?: string;
    /**
     * @todo: I saw in google's library that for codes they encrypt an id with expiration time.
     * You now the code was created by you because you can decrypt it, and you don't have to store
     * additional metadata on your server. It's similar to the signed / encrypted nonce
     */
    codeExpiresAt?: Date;
    /**
     * String value created by the Credential Issuer and opaque to the Wallet that
     * is used to bind the subsequent Authorization Request with the Credential Issuer to a context set up during previous steps.
     */
    issuerState?: string;
    /**
     * Scopes that are granted when the authorization is complete.
     */
    scopes?: string[];
    /**
     * Subject the issuance session is bound to. For internal authorization this will be defined
     * from the moment the token is issued. For external authorization this will be defined after
     * the first time the credential endpoint has been called.
     */
    subject?: string;
}
export interface OpenId4VcIssuanceSessionPresentation {
    /**
     * Whether presentation during issuance is required.
     */
    required: true;
    /**
     * Auth session for the presentation during issuance flow
     */
    authSession?: string;
    /**
     * The id of the `OpenId4VcVerificationSessionRecord` record this issuance session is linked to
     */
    openId4VcVerificationSessionId?: string;
}
export type DefaultOpenId4VcIssuanceSessionRecordTags = {
    issuerId: string;
    cNonce?: string;
    state: OpenId4VcIssuanceSessionState;
    credentialOfferUri?: string;
    preAuthorizedCode?: string;
    authorizationCode?: string;
    issuerState?: string;
    authorizationSubject?: string;
    presentationAuthSession?: string;
};
export interface OpenId4VcIssuanceSessionRecordProps {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    state: OpenId4VcIssuanceSessionState;
    issuerId: string;
    /**
     * Client id will mostly be used when doing auth flow
     */
    clientId?: string;
    preAuthorizedCode?: string;
    userPin?: string;
    pkce?: {
        codeChallengeMethod: PkceCodeChallengeMethod;
        codeChallenge: string;
    };
    /**
     * When authorization code flow is used, this links the authorization
     */
    authorization?: OpenId4VcIssuanceSessionAuthorization;
    /**
     * When presentation during issuance is required this should link the
     * `OpenId4VcVerificationSessionRecord` and state
     */
    presentation?: OpenId4VcIssuanceSessionPresentation;
    credentialOfferUri?: string;
    credentialOfferPayload: OpenId4VciCredentialOfferPayload;
    issuanceMetadata?: Record<string, unknown>;
    errorMessage?: string;
}
export declare class OpenId4VcIssuanceSessionRecord extends BaseRecord<DefaultOpenId4VcIssuanceSessionRecordTags> {
    static readonly type = "OpenId4VcIssuanceSessionRecord";
    readonly type = "OpenId4VcIssuanceSessionRecord";
    /**
     * The id of the issuer that this session is for.
     */
    issuerId: string;
    /**
     * The state of the issuance session.
     */
    state: OpenId4VcIssuanceSessionState;
    /**
     * The credentials that were issued during this session.
     */
    issuedCredentials: string[];
    /**
     * Pre authorized code used for the issuance session. Only used when a pre-authorized credential
     * offer is created.
     */
    preAuthorizedCode?: string;
    /**
     * Optional user pin that needs to be provided by the user in the access token request.
     */
    userPin?: string;
    /**
     * Client id of the exchange
     */
    clientId?: string;
    /**
     * Proof Key Code Exchange
     */
    pkce?: {
        codeChallengeMethod: PkceCodeChallengeMethod;
        codeChallenge: string;
    };
    /**
     * Authorization code flow specific metadata values
     */
    authorization?: OpenId4VcIssuanceSessionAuthorization;
    /**
     * Presentation during issuance specific metadata values
     */
    presentation?: OpenId4VcIssuanceSessionPresentation;
    /**
     * User-defined metadata that will be provided to the credential request to credential mapper
     * to allow to retrieve the needed credential input data. Can be the credential data itself,
     * or some other data that is needed to retrieve the credential data.
     */
    issuanceMetadata?: Record<string, unknown>;
    /**
     * The credential offer that was used to create the issuance session.
     */
    credentialOfferPayload: OpenId4VciCredentialOfferPayload;
    /**
     * URI of the credential offer. This is the url that cn can be used to retrieve
     * the credential offer
     */
    credentialOfferUri?: string;
    /**
     * Optional error message of the error that occurred during the issuance session. Will be set when state is {@link OpenId4VcIssuanceSessionState.Error}
     */
    errorMessage?: string;
    constructor(props: OpenId4VcIssuanceSessionRecordProps);
    assertState(expectedStates: OpenId4VcIssuanceSessionState | OpenId4VcIssuanceSessionState[]): void;
    getTags(): {
        issuerId: string;
        credentialOfferUri: string | undefined;
        state: OpenId4VcIssuanceSessionState;
        preAuthorizedCode: string | undefined;
        issuerState: string | undefined;
        authorizationCode: string | undefined;
        authorizationSubject: string | undefined;
        presentationAuthSession: string | undefined;
    };
}
