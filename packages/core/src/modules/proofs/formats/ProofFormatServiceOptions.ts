import type { Attachment } from '../../../decorators/attachment/Attachment'
import type { ProofFormatSpec } from '../models/ProofFormatSpec'
import type { ProofRecord } from '../repository'
import type { ProofFormat, ProofFormatPayload } from './ProofFormat'
import type { ProofFormatService } from './ProofFormatService'

/**
 * Get the service map for usage in the proofs module. Will return a type mapping of protocol version to service.
 *
 * @example
 * ```
 * type ProofFormatServiceMap = FormatServiceMap<[IndyProofFormat]>
 *
 * // equal to
 * type ProofFormatServiceMap = {
 *   indy: ProofFormatService<IndyProofFormat>
 * }
 * ```
 */
export type ProofFormatServiceMap<PFs extends ProofFormat[]> = {
  [PF in PFs[number] as PF['formatKey']]: ProofFormatService<PF>
}

/**
 * Base return type for all methods that create an attachment format.
 *
 * It requires an attachment and a format to be returned.
 */
export interface ProofFormatCreateReturn {
  format: ProofFormatSpec
  attachment: Attachment
}

export interface ProofFormatProcessOptions {
  attachment: Attachment
  proofRecord: ProofRecord
}

export interface ProofFormatProcessPresentationOptions extends ProofFormatProcessOptions {
  requestAttachment: Attachment
}

export interface ProofFormatCreateProposalOptions<PF extends ProofFormat> {
  proofRecord: ProofRecord
  proofFormats: ProofFormatPayload<[PF], 'createProposal'>

  attachmentId?: string
}

export interface ProofFormatAcceptProposalOptions<PF extends ProofFormat> {
  proofRecord: ProofRecord
  proofFormats?: ProofFormatPayload<[PF], 'acceptProposal'>

  attachmentId?: string
  proposalAttachment: Attachment
}

export interface ProofFormatCreateRequestOptions<PF extends ProofFormat> {
  proofRecord: ProofRecord
  proofFormats: ProofFormatPayload<[PF], 'createRequest'>

  attachmentId?: string
}

export interface ProofFormatAcceptRequestOptions<PF extends ProofFormat> {
  proofRecord: ProofRecord
  proofFormats?: ProofFormatPayload<[PF], 'acceptRequest'>

  attachmentId?: string
  proposalAttachment?: Attachment
  requestAttachment: Attachment
}

// Auto accept method interfaces
export interface ProofFormatAutoRespondProposalOptions {
  proofRecord: ProofRecord
  proposalAttachment: Attachment
  requestAttachment: Attachment
}

export interface ProofFormatAutoRespondRequestOptions {
  proofRecord: ProofRecord
  proposalAttachment: Attachment
  requestAttachment: Attachment
}

export interface ProofFormatAutoRespondPresentationOptions {
  proofRecord: ProofRecord
  proposalAttachment?: Attachment
  requestAttachment: Attachment
  presentationAttachment: Attachment
}
