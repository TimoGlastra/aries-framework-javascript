import type { OpenId4VciCredentialSupportedWithId, OpenId4VciCredentialConfigurationsSupported, OpenId4VciIssuerMetadataDisplay } from '../../shared';
import type { JwaSignatureAlgorithm, RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type OpenId4VcIssuerRecordTags = RecordTags<OpenId4VcIssuerRecord>;
export type DefaultOpenId4VcIssuerRecordTags = {
    issuerId: string;
};
export interface OpenId4VcIssuerRecordCredentialSupportedProps {
    credentialsSupported: OpenId4VciCredentialSupportedWithId[];
    credentialConfigurationsSupported?: never;
}
export interface OpenId4VcIssuerRecordCredentialConfigurationsSupportedProps {
    credentialsSupported?: never;
    credentialConfigurationsSupported: OpenId4VciCredentialConfigurationsSupported;
}
export type OpenId4VcIssuerRecordProps = {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    issuerId: string;
    /**
     * The fingerprint (multibase encoded) of the public key used to sign access tokens for
     * this issuer.
     */
    accessTokenPublicKeyFingerprint: string;
    /**
     * The DPoP signing algorithms supported by this issuer.
     * If not provided, dPoP is considered unsupported.
     */
    dpopSigningAlgValuesSupported?: [JwaSignatureAlgorithm, ...JwaSignatureAlgorithm[]];
    display?: OpenId4VciIssuerMetadataDisplay[];
} & (OpenId4VcIssuerRecordCredentialSupportedProps | OpenId4VcIssuerRecordCredentialConfigurationsSupportedProps);
/**
 * For OID4VC you need to expos metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
export declare class OpenId4VcIssuerRecord extends BaseRecord<DefaultOpenId4VcIssuerRecordTags> {
    static readonly type = "OpenId4VcIssuerRecord";
    readonly type = "OpenId4VcIssuerRecord";
    issuerId: string;
    accessTokenPublicKeyFingerprint: string;
    credentialsSupported: OpenId4VciCredentialSupportedWithId[];
    credentialConfigurationsSupported?: OpenId4VciCredentialConfigurationsSupported;
    display?: OpenId4VciIssuerMetadataDisplay[];
    dpopSigningAlgValuesSupported?: [JwaSignatureAlgorithm, ...JwaSignatureAlgorithm[]];
    constructor(props: OpenId4VcIssuerRecordProps);
    getTags(): {
        issuerId: string;
    };
}
