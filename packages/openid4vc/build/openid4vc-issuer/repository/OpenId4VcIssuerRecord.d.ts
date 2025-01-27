import type { OpenId4VciAuthorizationServerConfig, OpenId4VciCredentialConfigurationsSupportedWithFormats, OpenId4VciCredentialIssuerMetadataDisplay } from '../../shared';
import type { OpenId4VciBatchCredentialIssuanceOptions } from '../OpenId4VcIssuerServiceOptions';
import type { JwaSignatureAlgorithm, RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type OpenId4VcIssuerRecordTags = RecordTags<OpenId4VcIssuerRecord>;
export type DefaultOpenId4VcIssuerRecordTags = {
    issuerId: string;
};
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
    display?: OpenId4VciCredentialIssuerMetadataDisplay[];
    authorizationServerConfigs?: OpenId4VciAuthorizationServerConfig[];
    credentialConfigurationsSupported: OpenId4VciCredentialConfigurationsSupportedWithFormats;
    /**
     * Indicate support for batch issuane of credentials
     */
    batchCredentialIssuance?: OpenId4VciBatchCredentialIssuanceOptions;
};
/**
 * For OID4VC you need to expose metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
export declare class OpenId4VcIssuerRecord extends BaseRecord<DefaultOpenId4VcIssuerRecordTags> {
    static readonly type = "OpenId4VcIssuerRecord";
    readonly type = "OpenId4VcIssuerRecord";
    issuerId: string;
    accessTokenPublicKeyFingerprint: string;
    /**
     * Only here for class transformation. If credentialsSupported is set we transform
     * it to the new credentialConfigurationsSupported format
     */
    private set credentialsSupported(value);
    credentialConfigurationsSupported: OpenId4VciCredentialConfigurationsSupportedWithFormats;
    display?: OpenId4VciCredentialIssuerMetadataDisplay[];
    authorizationServerConfigs?: OpenId4VciAuthorizationServerConfig[];
    dpopSigningAlgValuesSupported?: [JwaSignatureAlgorithm, ...JwaSignatureAlgorithm[]];
    batchCredentialIssuance?: OpenId4VciBatchCredentialIssuanceOptions;
    constructor(props: OpenId4VcIssuerRecordProps);
    getTags(): {
        issuerId: string;
    };
}
