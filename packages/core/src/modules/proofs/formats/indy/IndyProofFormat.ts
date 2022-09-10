import type { Attachment } from '../../../../decorators/attachment/Attachment'
import type { CredentialPreviewAttributeOptions, IndyRevocationInterval } from '../../../credentials'
import type { GetRequestedCredentialsConfig } from '../../models'
import type { PresentationPreview } from '../../protocol/v1/models/V1PresentationPreview'
import type { ProofFormat } from '../ProofFormat'
import type { ProofAttributeInfo, ProofPredicateInfo } from './models'
import type { RequestedAttribute } from './models/RequestedAttribute'
import type { RequestedPredicate } from './models/RequestedPredicate'

export interface IndyProofFormatCreateRequestOptions {
  name: string
  version: string
  nonce?: string
  nonRevoked?: IndyRevocationInterval
  requestedAttributes?: Record<string, ProofAttributeInfo> | Map<string, ProofAttributeInfo>
  requestedPredicates?: Record<string, ProofPredicateInfo> | Map<string, ProofPredicateInfo>
}

export interface IndyProofFormatAcceptProposalOptions {
  name: string
  version: string
  nonce?: string
  nonRevoked?: IndyRevocationInterval
  requestedAttributes?: Record<string, ProofAttributeInfo> | Map<string, ProofAttributeInfo>
  requestedPredicates?: Record<string, ProofPredicateInfo> | Map<string, ProofPredicateInfo>
}

export interface IndyVerifyProofFormat {
  proofJson: Attachment
  proofRequest: Attachment
}

export interface IndyPresentationProofFormat {
  requestedAttributes?: Record<string, RequestedAttribute>
  requestedPredicates?: Record<string, RequestedPredicate>
  selfAttestedAttributes?: Record<string, string>
}

export interface GetRequestedCredentialsFormat {
  attachment: Attachment
  presentationProposal?: PresentationPreview
  config?: GetRequestedCredentialsConfig
}

// T-TODO: revise input data
// T-TODO: make sure all input data can be interfaces (no classes required)

/**
 * This defines the module payload for calling CredentialsApi.acceptProposal
 */
export interface IndyAcceptProposalFormat {
  credentialDefinitionId?: string
  attributes?: CredentialPreviewAttributeOptions[]
}

export interface IndyProofFormatRequestedCredentials {
  requestedAttributes: Record<string, RequestedAttribute>
  requestedPredicates: Record<string, RequestedPredicate>
  selfAttestedAttributes: Record<string, string>
}

export interface IndyRetrievedCredentialsFormat {
  requestedAttributes: Record<string, RequestedAttribute[]>
  requestedPredicates: Record<string, RequestedPredicate[]>
}

export interface IndyProofFormat extends ProofFormat {
  formatKey: 'indy'
  proofFormats: {
    createProposal: IndyProofFormatCreateRequestOptions
    acceptProposal: IndyProofFormatAcceptProposalOptions
    createRequest: IndyProofFormatCreateRequestOptions
    acceptRequest: IndyProofFormatRequestedCredentials

    getCredentialsForRequest: unknown
    autoSelectCredentialsForRequest: unknown
  }
  // Format data is based on RFC 0592
  // https://github.com/hyperledger/aries-rfcs/tree/main/features/0592-indy-attachments
  // formatData: {
  //   proposal: {
  //     schema_issuer_did?: string
  //     schema_name?: string
  //     schema_version?: string
  //     schema_id?: string
  //     issuer_did?: string
  //     cred_def_id?: string
  //   }
  //   offer: CredOffer
  //   request: CredReq
  //   credential: Cred
  // }
}
