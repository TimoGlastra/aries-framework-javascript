import type { AnonCredsAcceptOfferFormat, AnonCredsAcceptProposalFormat, AnonCredsAcceptRequestFormat, AnonCredsCredentialProposalFormat, AnonCredsOfferCredentialFormat, AnonCredsProposeCredentialFormat } from './AnonCredsCredentialFormat';
import type { AnonCredsCredential, AnonCredsCredentialOffer, AnonCredsCredentialRequest } from '../models';
import type { CredentialFormat } from '@credo-ts/core';
export type LegacyIndyCredentialProposalFormat = Omit<AnonCredsCredentialProposalFormat, 'schema_issuer_id' | 'issuer_id'>;
/**
 * This defines the module payload for calling CredentialsApi.createProposal
 * or CredentialsApi.negotiateOffer
 *
 * NOTE: This doesn't include the `issuerId` and `schemaIssuerId` properties that are present in the newer format.
 */
export type LegacyIndyProposeCredentialFormat = Omit<AnonCredsProposeCredentialFormat, 'schemaIssuerId' | 'issuerId'>;
export interface LegacyIndyCredentialRequest extends AnonCredsCredentialRequest {
    prover_did: string;
}
export interface LegacyIndyCredentialFormat extends CredentialFormat {
    formatKey: 'indy';
    credentialRecordType: 'w3c';
    credentialFormats: {
        createProposal: LegacyIndyProposeCredentialFormat;
        acceptProposal: AnonCredsAcceptProposalFormat;
        createOffer: AnonCredsOfferCredentialFormat;
        acceptOffer: AnonCredsAcceptOfferFormat;
        createRequest: never;
        acceptRequest: AnonCredsAcceptRequestFormat;
    };
    formatData: {
        proposal: LegacyIndyCredentialProposalFormat;
        offer: AnonCredsCredentialOffer;
        request: LegacyIndyCredentialRequest;
        credential: AnonCredsCredential;
    };
}
