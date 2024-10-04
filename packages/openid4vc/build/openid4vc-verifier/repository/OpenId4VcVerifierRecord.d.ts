import type { RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type OpenId4VcVerifierRecordTags = RecordTags<OpenId4VcVerifierRecord>;
export type DefaultOpenId4VcVerifierRecordTags = {
    verifierId: string;
};
export interface OpenId4VcVerifierRecordProps {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    verifierId: string;
}
/**
 * For OID4VC you need to expos metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
export declare class OpenId4VcVerifierRecord extends BaseRecord<DefaultOpenId4VcVerifierRecordTags> {
    static readonly type = "OpenId4VcVerifierRecord";
    readonly type = "OpenId4VcVerifierRecord";
    verifierId: string;
    constructor(props: OpenId4VcVerifierRecordProps);
    getTags(): {
        verifierId: string;
    };
}
