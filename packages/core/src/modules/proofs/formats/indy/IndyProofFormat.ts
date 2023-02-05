import type { ProofAttributeInfo, ProofPredicateInfo } from './models'
import type { RequestedAttribute } from './models/RequestedAttribute'
import type { RequestedPredicate } from './models/RequestedPredicate'
import type { V1PresentationPreviewAttributeOptions, V1PresentationPreviewPredicateOptions } from '../../protocol/v1'
import type { ProofFormat } from '../ProofFormat'
import type { IndyProof, IndyProofRequest } from 'indy-sdk'

/**
 * Interface for creating an indy proof proposal.
 */
export interface IndyProposeProofFormat {
  name?: string
  version?: string
  attributes?: V1PresentationPreviewAttributeOptions[]
  predicates?: V1PresentationPreviewPredicateOptions[]
}

/**
 * Interface for creating an indy proof request.
 */
export interface IndyRequestProofFormat {
  name: string
  version: string
  // TODO: update to AnonCredsNonRevokedInterval when moving to AnonCreds package
  nonRevoked?: { from?: number; to?: number }
  // TODO: should not be needed to pass class instances
  requestedAttributes?: Record<string, ProofAttributeInfo>
  requestedPredicates?: Record<string, ProofPredicateInfo>
}

/**
 * Interface for accepting an indy proof request.
 */
export type IndyAcceptProofRequestFormat = Partial<IndySelectedCredentialsForProofRequest>

export interface IndySelectedCredentialsForProofRequest {
  requestedAttributes: Record<string, RequestedAttribute>
  requestedPredicates: Record<string, RequestedPredicate>
  selfAttestedAttributes: Record<string, string>
}

// TODO: should not require classes (will be solved once we use the AnonCreds interfaces)
/**
 * Interface for getting credentials for an indy proof request.
 */
export interface IndyCredentialsForProofRequest {
  attributes: Record<string, RequestedAttribute[]>
  predicates: Record<string, RequestedPredicate[]>
}

export interface IndyGetCredentialsForProofRequestOptions {
  filterByNonRevocationRequirements?: boolean
}

export interface IndyProofFormat extends ProofFormat {
  formatKey: 'indy'

  proofFormats: {
    createProposal: IndyProposeProofFormat
    acceptProposal: {
      name?: string
      version?: string
    }
    createRequest: IndyRequestProofFormat
    acceptRequest: IndyAcceptProofRequestFormat

    getCredentialsForRequest: {
      input: IndyGetCredentialsForProofRequestOptions
      output: IndyCredentialsForProofRequest
    }
    selectCredentialsForRequest: {
      input: IndyGetCredentialsForProofRequestOptions
      output: IndySelectedCredentialsForProofRequest
    }
  }

  formatData: {
    proposal: IndyProofRequest
    request: IndyProofRequest
    presentation: IndyProof
  }
}
