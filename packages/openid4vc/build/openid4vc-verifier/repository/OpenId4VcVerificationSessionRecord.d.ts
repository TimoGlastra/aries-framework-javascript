import type { OpenId4VcSiopAuthorizationResponsePayload } from '../../shared/models';
import type { OpenId4VcVerificationSessionState } from '../OpenId4VcVerificationSessionState';
import type { RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type OpenId4VcVerificationSessionRecordTags = RecordTags<OpenId4VcVerificationSessionRecord>;
export type DefaultOpenId4VcVerificationSessionRecordTags = {
    verifierId: string;
    state: OpenId4VcVerificationSessionState;
    nonce: string;
    payloadState: string;
    authorizationRequestUri: string;
};
export interface OpenId4VcVerificationSessionRecordProps {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    verifierId: string;
    state: OpenId4VcVerificationSessionState;
    errorMessage?: string;
    authorizationRequestUri: string;
    authorizationRequestJwt: string;
    authorizationResponsePayload?: OpenId4VcSiopAuthorizationResponsePayload;
}
export declare class OpenId4VcVerificationSessionRecord extends BaseRecord<DefaultOpenId4VcVerificationSessionRecordTags> {
    static readonly type = "OpenId4VcVerificationSessionRecord";
    readonly type = "OpenId4VcVerificationSessionRecord";
    /**
     * The id of the verifier that this session is for.
     */
    verifierId: string;
    /**
     * The state of the verification session.
     */
    state: OpenId4VcVerificationSessionState;
    /**
     * Optional error message of the error that occurred during the verification session. Will be set when state is {@link OpenId4VcVerificationSessionState.Error}
     */
    errorMessage?: string;
    /**
     * The signed JWT containing the authorization request
     */
    authorizationRequestJwt: string;
    /**
     * URI of the authorization request. This is the url that can be used to
     * retrieve the authorization request
     */
    authorizationRequestUri: string;
    /**
     * The payload of the received authorization response
     */
    authorizationResponsePayload?: OpenId4VcSiopAuthorizationResponsePayload;
    constructor(props: OpenId4VcVerificationSessionRecordProps);
    assertState(expectedStates: OpenId4VcVerificationSessionState | OpenId4VcVerificationSessionState[]): void;
    getTags(): {
        verifierId: string;
        state: OpenId4VcVerificationSessionState;
        nonce: string;
        payloadState: string;
        authorizationRequestUri: string;
    };
}
