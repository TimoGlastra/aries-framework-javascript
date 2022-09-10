import type { AgentMessage } from '../../../agent/AgentMessage'
import type { ConnectionRecord } from '../../connections'
import type { ProofFormat, ProofFormatPayload } from '../formats/ProofFormat'
import type { ProofRecord } from '../repository'
import type { AutoAcceptProof } from './ProofAutoAcceptType'

// T-TODO: base options should not be included in all messages?
interface BaseOptions {
  willConfirm?: boolean
  goalCode?: string
  comment?: string
  autoAcceptProof?: AutoAcceptProof
}

export interface CreateProposalOptions<PFs extends ProofFormat[]> extends BaseOptions {
  connectionRecord: ConnectionRecord
  proofFormats: ProofFormatPayload<PFs, 'createProposal'>
  parentThreadId?: string
}

export interface AcceptProposalOptions<PFs extends ProofFormat[]> extends BaseOptions {
  proofRecord: ProofRecord
  proofFormats: ProofFormatPayload<PFs, 'acceptProposal'>
}

export interface CreateRequestOptions<PFs extends ProofFormat[]> extends BaseOptions {
  connectionRecord?: ConnectionRecord
  proofFormats: ProofFormatPayload<PFs, 'createRequest'>
  parentThreadId?: string
}

export interface AcceptRequestOptions<PFs extends ProofFormat[]> extends BaseOptions {
  proofRecord: ProofRecord
  proofFormats?: ProofFormatPayload<PFs, 'acceptRequest'>
}

export interface CreateAckOptions {
  proofRecord: ProofRecord
}

export interface DeleteProofOptions {
  deleteAssociatedDidCommMessages?: boolean
}

export interface ProofProtocolMsgReturnType<MessageType extends AgentMessage = AgentMessage> {
  message: MessageType
  proofRecord: ProofRecord
}
export interface CreateProblemReportOptions {
  message: string
}
