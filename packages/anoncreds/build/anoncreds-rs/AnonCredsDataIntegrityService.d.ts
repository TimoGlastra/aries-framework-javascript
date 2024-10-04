import type { AnonCredsProofRequest } from '../models';
import type { CredentialWithRevocationMetadata } from '../models/utils';
import type { AnonCredsCredentialProve } from '../services';
import type { AgentContext, IAnonCredsDataIntegrityService, AnoncredsDataIntegrityVerifyPresentation, DifPresentationExchangeDefinition, DifPresentationExchangeSubmission, W3cCredentialRecord, W3cJsonLdVerifiableCredential } from '@credo-ts/core';
export type PathComponent = string | number;
export declare class AnonCredsDataIntegrityService implements IAnonCredsDataIntegrityService {
    private getDataIntegrityProof;
    private extractPathNodes;
    private getCredentialMetadataForDescriptor;
    private descriptorRequiresRevocationStatus;
    private getPredicateTypeAndValues;
    private getClaimNameForField;
    createAnonCredsProofRequestAndMetadata: (agentContext: AgentContext, presentationDefinition: DifPresentationExchangeDefinition, presentationSubmission: DifPresentationExchangeSubmission, credentials: W3cJsonLdVerifiableCredential[], challenge: string) => Promise<{
        anonCredsProofRequest: AnonCredsProofRequest;
        credentialsWithMetadata: CredentialWithRevocationMetadata[];
        credentialsProve: AnonCredsCredentialProve[];
        schemaIds: Set<string>;
        credentialDefinitionIds: Set<string>;
    }>;
    createPresentation(agentContext: AgentContext, options: {
        presentationDefinition: DifPresentationExchangeDefinition;
        presentationSubmission: DifPresentationExchangeSubmission;
        selectedCredentialRecords: W3cCredentialRecord[];
        challenge: string;
    }): Promise<import("@credo-ts/core").W3cJsonLdVerifiablePresentation>;
    verifyPresentation(agentContext: AgentContext, options: AnoncredsDataIntegrityVerifyPresentation): Promise<boolean>;
}
