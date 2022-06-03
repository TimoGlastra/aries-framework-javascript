import type { EventEmitter } from '../../../agent/EventEmitter'
import type { CredentialFormatSpec } from '../models/CredentialFormatSpec'
import type { CredentialRepository } from '../repository'
import type { CredentialFormat } from './CredentialFormat'
import type {
  HandlerAutoAcceptOptions,
  FormatCreateProposalOptions,
  FormatCreateProposalReturn,
  FormatProcessOptions,
  FormatCreateOfferOptions,
  FormatCreateOfferReturn,
  FormatCreateRequestOptions,
  FormatCreateReturn,
  FormatAcceptRequestOptions,
  FormatAcceptOfferOptions,
  FormatAcceptProposalOptions,
} from './CredentialFormatServiceOptions'

import { Attachment, AttachmentData } from '../../../decorators/attachment/Attachment'
import { JsonEncoder } from '../../../utils/JsonEncoder'

export abstract class CredentialFormatService<CF extends CredentialFormat> {
  protected credentialRepository: CredentialRepository
  protected eventEmitter: EventEmitter

  public constructor(credentialRepository: CredentialRepository, eventEmitter: EventEmitter) {
    this.credentialRepository = credentialRepository
    this.eventEmitter = eventEmitter
  }

  // proposal methods
  abstract createProposal(options: FormatCreateProposalOptions<CF>): Promise<FormatCreateProposalReturn>
  abstract processProposal(options: FormatProcessOptions): Promise<void>
  abstract acceptProposal(options: FormatAcceptProposalOptions<CF>): Promise<FormatCreateOfferReturn>

  // offer methods
  abstract createOffer(options: FormatCreateOfferOptions<CF>): Promise<FormatCreateOfferReturn>
  abstract processOffer(options: FormatProcessOptions): Promise<void>
  abstract acceptOffer(options: FormatAcceptOfferOptions<CF>): Promise<FormatCreateReturn>

  // request methods
  abstract createRequest(options: FormatCreateRequestOptions<CF>): Promise<FormatCreateReturn>
  abstract processRequest(options: FormatProcessOptions): Promise<void>
  abstract acceptRequest(options: FormatAcceptRequestOptions<CF>): Promise<FormatCreateReturn>

  // credential methods
  abstract processCredential(options: FormatProcessOptions): Promise<void>

  // T-TODO: revise interface for methods
  abstract shouldAutoRespondToProposal(options: HandlerAutoAcceptOptions): boolean
  abstract shouldAutoRespondToRequest(options: HandlerAutoAcceptOptions): boolean
  abstract shouldAutoRespondToCredential(options: HandlerAutoAcceptOptions): boolean

  abstract deleteCredentialById(credentialId: string): Promise<void>

  abstract supportsFormat(format: string): boolean

  /**
   *
   * Returns an object of type {@link Attachment} for use in credential exchange messages.
   * It looks up the correct format identifier and encodes the data as a base64 attachment.
   *
   * @param data The data to include in the attach object
   * @param id the attach id from the formats component of the message
   * @returns attachment to the credential proposal
   */
  public getFormatData(data: unknown, id: string): Attachment {
    const attachment = new Attachment({
      id,
      mimeType: 'application/json',
      data: new AttachmentData({
        base64: JsonEncoder.toBase64(data),
      }),
    })

    return attachment
  }

  /**
   * Gets the attachment object for a given attachId. We need to get out the correct attachId for
   * indy and then find the corresponding attachment (if there is one)
   * @param formats the formats object containing the attachId
   * @param messageAttachments the attachment containing the payload
   * @returns The Attachment if found or undefined
   */
  abstract getAttachment(formats: CredentialFormatSpec[], messageAttachments: Attachment[]): Attachment | undefined
}
