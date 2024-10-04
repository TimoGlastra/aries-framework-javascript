import type { OpenId4VciCredentialOfferPayload } from '../../shared';
import type { RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
import { OpenId4VcIssuanceSessionState } from '../OpenId4VcIssuanceSessionState';
export type OpenId4VcIssuanceSessionRecordTags = RecordTags<OpenId4VcIssuanceSessionRecord>;
export type DefaultOpenId4VcIssuanceSessionRecordTags = {
    issuerId: string;
    cNonce?: string;
    preAuthorizedCode?: string;
    state: OpenId4VcIssuanceSessionState;
    credentialOfferUri: string;
};
export interface OpenId4VcIssuanceSessionRecordProps {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    issuerId: string;
    cNonce?: string;
    cNonceExpiresAt?: Date;
    preAuthorizedCode?: string;
    userPin?: string;
    credentialOfferUri: string;
    credentialOfferPayload: OpenId4VciCredentialOfferPayload;
    issuanceMetadata?: Record<string, unknown>;
    state: OpenId4VcIssuanceSessionState;
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
     * cNonce that should be used in the credential request by the holder.
     */
    cNonce?: string;
    /**
     * The time at which the cNonce expires.
     */
    cNonceExpiresAt?: Date;
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
    credentialOfferUri: string;
    /**
     * Optional error message of the error that occurred during the issuance session. Will be set when state is {@link OpenId4VcIssuanceSessionState.Error}
     */
    errorMessage?: string;
    constructor(props: OpenId4VcIssuanceSessionRecordProps);
    assertState(expectedStates: OpenId4VcIssuanceSessionState | OpenId4VcIssuanceSessionState[]): void;
    getTags(): {
        issuerId: string;
        cNonce: string | undefined;
        credentialOfferUri: string;
        preAuthorizedCode: string | undefined;
        state: OpenId4VcIssuanceSessionState;
    };
}
