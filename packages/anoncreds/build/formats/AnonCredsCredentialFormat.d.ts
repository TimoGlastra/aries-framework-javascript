import type { AnonCredsCredential, AnonCredsCredentialOffer, AnonCredsCredentialRequest } from '../models';
import type { CredentialPreviewAttributeOptions, CredentialFormat, LinkedAttachment } from '@credo-ts/core';
export interface AnonCredsCredentialProposalFormat {
    schema_issuer_id?: string;
    schema_name?: string;
    schema_version?: string;
    schema_id?: string;
    cred_def_id?: string;
    issuer_id?: string;
    schema_issuer_did?: string;
    issuer_did?: string;
}
/**
 * This defines the module payload for calling CredentialsApi.createProposal
 * or CredentialsApi.negotiateOffer
 */
export interface AnonCredsProposeCredentialFormat {
    schemaIssuerId?: string;
    schemaId?: string;
    schemaName?: string;
    schemaVersion?: string;
    credentialDefinitionId?: string;
    issuerId?: string;
    attributes?: CredentialPreviewAttributeOptions[];
    linkedAttachments?: LinkedAttachment[];
    schemaIssuerDid?: string;
    issuerDid?: string;
}
/**
 * This defines the module payload for calling CredentialsApi.acceptProposal
 */
export interface AnonCredsAcceptProposalFormat {
    credentialDefinitionId?: string;
    revocationRegistryDefinitionId?: string;
    revocationRegistryIndex?: number;
    attributes?: CredentialPreviewAttributeOptions[];
    linkedAttachments?: LinkedAttachment[];
}
/**
 * This defines the module payload for calling CredentialsApi.acceptOffer. No options are available for this
 * method, so it's an empty object
 */
export interface AnonCredsAcceptOfferFormat {
    linkSecretId?: string;
}
/**
 * This defines the module payload for calling CredentialsApi.offerCredential
 * or CredentialsApi.negotiateProposal
 */
export interface AnonCredsOfferCredentialFormat {
    credentialDefinitionId: string;
    revocationRegistryDefinitionId?: string;
    revocationRegistryIndex?: number;
    attributes: CredentialPreviewAttributeOptions[];
    linkedAttachments?: LinkedAttachment[];
}
/**
 * This defines the module payload for calling CredentialsApi.acceptRequest. No options are available for this
 * method, so it's an empty object
 */
export type AnonCredsAcceptRequestFormat = Record<string, never>;
export interface AnonCredsCredentialFormat extends CredentialFormat {
    formatKey: 'anoncreds';
    credentialRecordType: 'w3c';
    credentialFormats: {
        createProposal: AnonCredsProposeCredentialFormat;
        acceptProposal: AnonCredsAcceptProposalFormat;
        createOffer: AnonCredsOfferCredentialFormat;
        acceptOffer: AnonCredsAcceptOfferFormat;
        createRequest: never;
        acceptRequest: AnonCredsAcceptRequestFormat;
    };
    formatData: {
        proposal: AnonCredsCredentialProposalFormat;
        offer: AnonCredsCredentialOffer;
        request: AnonCredsCredentialRequest;
        credential: AnonCredsCredential;
    };
}
