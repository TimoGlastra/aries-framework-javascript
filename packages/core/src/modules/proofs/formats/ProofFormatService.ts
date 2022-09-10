import type { AgentContext } from '../../../agent'
import type { ProofFormat } from './ProofFormat'
import type {
  ProofFormatAcceptProposalOptions,
  ProofFormatAcceptRequestOptions,
  ProofFormatCreateProposalOptions,
  ProofFormatCreateRequestOptions,
  ProofFormatCreateReturn,
  ProofFormatProcessOptions,
} from './ProofFormatServiceOptions'

import { Attachment, AttachmentData } from '../../../decorators/attachment/Attachment'
import { JsonEncoder } from '../../../utils'

export abstract class ProofFormatService<PF extends ProofFormat = ProofFormat> {
  abstract readonly formatKey: PF['formatKey']

  // proposal methods
  abstract createProposal(
    agentContext: AgentContext,
    options: ProofFormatCreateProposalOptions<PF>
  ): Promise<ProofFormatCreateReturn>
  abstract processProposal(agentContext: AgentContext, options: ProofFormatProcessOptions): Promise<void>
  abstract acceptProposal(
    agentContext: AgentContext,
    options: ProofFormatAcceptProposalOptions<PF>
  ): Promise<ProofFormatCreateReturn>

  // request methods
  abstract createRequest(
    agentContext: AgentContext,
    options: ProofFormatCreateRequestOptions<PF>
  ): Promise<ProofFormatCreateReturn>
  abstract processRequest(agentContext: AgentContext, options: ProofFormatProcessOptions): Promise<void>
  abstract acceptRequest(
    agentContext: AgentContext,
    options: ProofFormatAcceptRequestOptions<PF>
  ): Promise<ProofFormatCreateReturn>

  // presentation methods
  abstract processPresentation(agentContext: AgentContext, options: ProofFormatProcessOptions): Promise<boolean>

  // M-TODO: review
  // public abstract getCredentialsForRequest(
  //   agentContext: AgentContext,
  //   options: GetRequestedCredentialsFormat
  // ): Promise<FormatRetrievedCredentialOptions<[PF]>>
  // public abstract autoSelectCredentialsForProofRequest(
  //   options: FormatRetrievedCredentialOptions<[PF]>
  // ): Promise<FormatRequestedCredentialReturn<[PF]>>
  // abstract proposalAndRequestAreEqual(
  //   proposalAttachments: ProofAttachmentFormat[],
  //   requestAttachments: ProofAttachmentFormat[]
  // ): boolean

  abstract supportsFormat(format: string): boolean

  /**
   * Returns an object of type {@link Attachment} for use in presentation exchange messages.
   * It looks up the correct format identifier and encodes the data as a base64 attachment.
   *
   * @param data The data to include in the attach object
   * @param id the attach id from the formats component of the message
   */
  protected getFormatData(data: unknown, id: string): Attachment {
    const attachment = new Attachment({
      id,
      mimeType: 'application/json',
      data: new AttachmentData({
        base64: JsonEncoder.toBase64(data),
      }),
    })

    return attachment
  }
}
