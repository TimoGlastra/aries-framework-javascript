import type { AnonCredsCredentialDefinition, AnonCredsProof, AnonCredsRevocationRegistryDefinition, AnonCredsSchema, AnonCredsCredential, AnonCredsCredentialInfo } from '../models';
import type { GetCredentialsForProofRequestOptions, GetCredentialsForProofRequestReturn, AnonCredsHolderService, CreateLinkSecretOptions, CreateLinkSecretReturn, CreateProofOptions, CreateCredentialRequestOptions, CreateCredentialRequestReturn, GetCredentialOptions, GetCredentialsOptions, StoreCredentialOptions } from '../services';
import type { CreateW3cPresentationOptions, LegacyToW3cCredentialOptions, W3cToLegacyCredentialOptions } from '../services/AnonCredsHolderServiceOptions';
import type { AnonCredsCredentialRequestMetadata } from '../utils/metadata';
import type { AgentContext } from '@credo-ts/core';
import { W3cCredentialRecord, W3cJsonLdVerifiableCredential, W3cJsonLdVerifiablePresentation } from '@credo-ts/core';
export declare class AnonCredsRsHolderService implements AnonCredsHolderService {
    createLinkSecret(agentContext: AgentContext, options?: CreateLinkSecretOptions): Promise<CreateLinkSecretReturn>;
    createProof(agentContext: AgentContext, options: CreateProofOptions): Promise<AnonCredsProof>;
    createCredentialRequest(agentContext: AgentContext, options: CreateCredentialRequestOptions): Promise<CreateCredentialRequestReturn>;
    w3cToLegacyCredential(agentContext: AgentContext, options: W3cToLegacyCredentialOptions): Promise<AnonCredsCredential>;
    processW3cCredential(agentContext: AgentContext, credential: W3cJsonLdVerifiableCredential, processOptions: {
        credentialDefinition: AnonCredsCredentialDefinition;
        credentialRequestMetadata: AnonCredsCredentialRequestMetadata;
        revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition | undefined;
    }): Promise<W3cJsonLdVerifiableCredential>;
    legacyToW3cCredential(agentContext: AgentContext, options: LegacyToW3cCredentialOptions): Promise<W3cJsonLdVerifiableCredential>;
    storeW3cCredential(agentContext: AgentContext, options: {
        credential: W3cJsonLdVerifiableCredential;
        credentialDefinitionId: string;
        schema: AnonCredsSchema;
        credentialDefinition: AnonCredsCredentialDefinition;
        revocationRegistryDefinition?: AnonCredsRevocationRegistryDefinition;
        revocationRegistryId?: string;
        credentialRequestMetadata: AnonCredsCredentialRequestMetadata;
    }): Promise<W3cCredentialRecord>;
    storeCredential(agentContext: AgentContext, options: StoreCredentialOptions): Promise<string>;
    getCredential(agentContext: AgentContext, options: GetCredentialOptions): Promise<AnonCredsCredentialInfo>;
    private getLegacyCredentials;
    getCredentials(agentContext: AgentContext, options: GetCredentialsOptions): Promise<AnonCredsCredentialInfo[]>;
    deleteCredential(agentContext: AgentContext, id: string): Promise<void>;
    private getLegacyCredentialsForProofRequest;
    getCredentialsForProofRequest(agentContext: AgentContext, options: GetCredentialsForProofRequestOptions): Promise<GetCredentialsForProofRequestReturn>;
    private queryFromRestrictions;
    private queryLegacyFromRestrictions;
    private getPresentationMetadata;
    createW3cPresentation(agentContext: AgentContext, options: CreateW3cPresentationOptions): Promise<W3cJsonLdVerifiablePresentation>;
}
