import type { Attachment } from '../../../../decorators/attachment/Attachment'
import type { Logger } from '../../../../logger'
import type { CredentialPreviewAttributeOptions } from '../../models/CredentialPreviewAttribute'
import type { CredentialExchangeRecord } from '../../repository/CredentialExchangeRecord'
import type {
  FormatAcceptOfferOptions,
  FormatAcceptProposalOptions,
  FormatAcceptRequestOptions,
  FormatCreateOfferOptions,
  FormatCreateOfferReturn,
  FormatCreateProposalOptions,
  FormatCreateProposalReturn,
  FormatCreateReturn,
  FormatProcessOptions,
  HandlerAutoAcceptOptions,
} from '../CredentialFormatServiceOptions'
import type { IndyCredentialFormat, IndyProposeCredentialFormat } from './IndyCredentialFormat'
import type * as Indy from 'indy-sdk'

import { inject, Lifecycle, scoped } from 'tsyringe'

import { AgentConfig } from '../../../../agent/AgentConfig'
import { EventEmitter } from '../../../../agent/EventEmitter'
import { InjectionSymbols } from '../../../../constants'
import { AriesFrameworkError } from '../../../../error'
import { JsonTransformer } from '../../../../utils/JsonTransformer'
import { MessageValidator } from '../../../../utils/MessageValidator'
import { getIndyDidFromVerificationMethod } from '../../../../utils/did'
import { uuid } from '../../../../utils/uuid'
import { Wallet } from '../../../../wallet/Wallet'
import { ConnectionService } from '../../../connections'
import { DidResolverService, findVerificationMethodByKeyType } from '../../../dids'
import { IndyHolderService, IndyIssuerService } from '../../../indy'
import { IndyLedgerService } from '../../../ledger'
import { credOffer } from '../../__tests__/fixtures'
import { CredentialProblemReportError, CredentialProblemReportReason } from '../../errors'
import { AutoAcceptCredential } from '../../models/CredentialAutoAcceptType'
import { CredentialFormatSpec } from '../../models/CredentialFormatSpec'
import { CredentialPreviewAttribute } from '../../models/CredentialPreviewAttribute'
import { CredentialMetadataKeys } from '../../repository/CredentialMetadataTypes'
import { CredentialRepository } from '../../repository/CredentialRepository'
import { composeAutoAccept } from '../../util/composeAutoAccept'
import { CredentialFormatService } from '../CredentialFormatService'

import { IndyCredentialUtils } from './IndyCredentialUtils'
import { IndyCredPropose } from './models/IndyCredPropose'

const INDY_CRED_ABSTRACT = 'hlindy/cred-abstract@v2.0'
const INDY_CRED_REQUEST = 'hlindy/cred-req@v2.0'
const INDY_CRED_FILTER = 'hlindy/cred-filter@v2.0'

@scoped(Lifecycle.ContainerScoped)
export class IndyCredentialFormatService extends CredentialFormatService<IndyCredentialFormat> {
  private indyIssuerService: IndyIssuerService
  private indyLedgerService: IndyLedgerService
  private indyHolderService: IndyHolderService
  private connectionService: ConnectionService
  private didResolver: DidResolverService
  private wallet: Wallet
  private logger: Logger

  public constructor(
    credentialRepository: CredentialRepository,
    eventEmitter: EventEmitter,
    indyIssuerService: IndyIssuerService,
    indyLedgerService: IndyLedgerService,
    indyHolderService: IndyHolderService,
    connectionService: ConnectionService,
    didResolver: DidResolverService,
    agentConfig: AgentConfig,
    @inject(InjectionSymbols.Wallet) wallet: Wallet
  ) {
    super(credentialRepository, eventEmitter)
    this.indyIssuerService = indyIssuerService
    this.indyLedgerService = indyLedgerService
    this.indyHolderService = indyHolderService
    this.connectionService = connectionService
    this.didResolver = didResolver
    this.wallet = wallet
    this.logger = agentConfig.logger
  }

  public readonly formatKey = 'indy' as const

  /**
   * Create a {@link AttachmentFormats} object dependent on the message type.
   *
   * @param options The object containing all the options for the proposed credential
   * @returns object containing associated attachment, format and optionally the credential preview
   *
   */
  public async createProposal({
    credentialFormats,
    credentialRecord,
  }: FormatCreateProposalOptions<IndyCredentialFormat>): Promise<FormatCreateProposalReturn> {
    const format = new CredentialFormatSpec({
      format: INDY_CRED_FILTER,
    })

    const indyFormat = credentialFormats.indy

    if (!indyFormat) {
      throw new AriesFrameworkError('Missing indy payload createProposal')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attributes, linkedAttachments, ...indyCredentialProposal } = indyFormat

    const proposal = new IndyCredPropose(indyCredentialProposal)

    try {
      await MessageValidator.validate(proposal)
    } catch (error) {
      throw new AriesFrameworkError(`Invalid proposal supplied: ${indyCredentialProposal} in Indy Format Service`)
    }

    const proposalJson = JsonTransformer.toJSON(proposal)
    const attachment = this.getFormatData(proposalJson, format.attachId)

    // T-TODO: What do we do with the linked attachments?
    const { previewAttributes } = this.getCredentialLinkedAttachments(indyFormat)

    // Set the metadata
    credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
      schemaId: proposal.schemaId,
      credentialDefinitionId: proposal.credentialDefinitionId,
    })

    return { format, attachment, previewAttributes }
  }

  public async processProposal({ attachment, credentialRecord }: FormatProcessOptions): Promise<void> {
    const credProposalJson = attachment.getDataAsJson()

    if (!credProposalJson) {
      throw new AriesFrameworkError('Missing indy credential proposal data payload')
    }

    const credProposal = JsonTransformer.fromJSON(credProposalJson, IndyCredPropose)
    await MessageValidator.validate(credProposal)

    credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
      schemaId: credProposal.schemaId,
      credentialDefinitionId: credProposal.credentialDefinitionId,
    })
  }

  public async acceptProposal({
    attachId,
    credentialFormats,
    credentialRecord,
  }: FormatAcceptProposalOptions<IndyCredentialFormat>): Promise<FormatCreateOfferReturn> {
    const indyFormat = credentialFormats?.indy

    const indyMetadata = credentialRecord.metadata.get(CredentialMetadataKeys.IndyCredential)
    const credentialDefinitionId = indyFormat?.credentialDefinitionId ?? indyMetadata?.credentialDefinitionId
    const attributes = indyFormat?.attributes ?? credentialRecord.credentialAttributes

    if (!credentialDefinitionId) {
      throw new AriesFrameworkError(
        'No credentialDefinitionId in proposal or provided as input to accept proposal method.'
      )
    }

    if (!attributes) {
      throw new AriesFrameworkError('No attributes in proposal or provided as input to accept proposal method.')
    }

    const { format, attachment, previewAttributes } = await this.createIndyOffer({
      credentialRecord,
      attachId,
      attributes,
      credentialDefinitionId: credentialDefinitionId,
    })

    return { format, attachment, previewAttributes }
  }

  /**
   * Create a {@link AttachmentFormats} object dependent on the message type.
   *
   * @param options The object containing all the options for the credential offer
   * @param messageType the type of message which can be Indy, JsonLd etc eg "CRED_20_OFFER"
   * @returns object containing associated attachment, formats and offersAttach elements
   *
   */
  public async createOffer({
    credentialFormats,
    credentialRecord,
    attachId,
  }: FormatCreateOfferOptions<IndyCredentialFormat>): Promise<FormatCreateOfferReturn> {
    const indyFormat = credentialFormats.indy

    if (!indyFormat) {
      throw new AriesFrameworkError('Missing indy credentialFormat data')
    }

    const { format, attachment, previewAttributes } = await this.createIndyOffer({
      credentialRecord,
      attachId,
      attributes: indyFormat.attributes,
      credentialDefinitionId: indyFormat.credentialDefinitionId,
    })

    return { format, attachment, previewAttributes }
  }

  public async processOffer({ attachment, credentialRecord }: FormatProcessOptions) {
    this.logger.debug(`Processing indy credential offer for credential record ${credentialRecord.id}`)

    const credOffer = attachment.getDataAsJson<Indy.CredOffer>()

    if (!credOffer.schema_id || !credOffer.cred_def_id) {
      throw new CredentialProblemReportError('Invalid credential offer', {
        problemCode: CredentialProblemReportReason.IssuanceAbandoned,
      })
    }

    credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
      schemaId: credOffer.schema_id,
      credentialDefinitionId: credOffer.cred_def_id,
    })
  }

  public async acceptOffer({
    credentialFormats,
    credentialRecord,
    attachId,
    offerAttachment,
  }: FormatAcceptOfferOptions<IndyCredentialFormat>): Promise<FormatCreateReturn> {
    const indyFormat = credentialFormats?.indy

    const holderDid = indyFormat?.holderDid ?? (await this.getIndyHolderDid(credentialRecord))

    const credentialOffer = offerAttachment.getDataAsJson<Indy.CredOffer>()
    const credentialDefinition = await this.indyLedgerService.getCredentialDefinition(credentialOffer.cred_def_id)

    const [credentialRequest, credentialRequestMetadata] = await this.indyHolderService.createCredentialRequest({
      holderDid,
      credentialOffer,
      credentialDefinition,
    })
    credentialRecord.metadata.set(CredentialMetadataKeys.IndyRequest, credentialRequestMetadata)

    const format = new CredentialFormatSpec({
      attachId,
      format: INDY_CRED_REQUEST,
    })

    const attachment = this.getFormatData(credentialRequest, format.attachId)
    return { format, attachment }
  }

  /**
   * Starting from a request is not supported for indy credentials, this method only throws an error.
   */
  public async createRequest(): Promise<FormatCreateReturn> {
    throw new AriesFrameworkError('Starting from a request is not supported for indy credentials')
  }

  /**
   * We don't have any models to validate an indy request object, for now this method does nothing
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async processRequest(options: FormatProcessOptions): Promise<void> {
    // not needed for Indy
  }

  public async acceptRequest({
    credentialRecord,
    attachId,
    offerAttachment,
    requestAttachment,
  }: FormatAcceptRequestOptions<IndyCredentialFormat>): Promise<FormatCreateReturn> {
    // Assert credential attributes
    const credentialAttributes = credentialRecord.credentialAttributes
    if (!credentialAttributes) {
      throw new CredentialProblemReportError(
        `Missing required credential attribute values on credential record with id ${credentialRecord.id}`,
        { problemCode: CredentialProblemReportReason.IssuanceAbandoned }
      )
    }

    const credOffer = offerAttachment?.getDataAsJson<Indy.CredOffer>()
    const credRequest = requestAttachment.getDataAsJson<Indy.CredReq>()

    if (!credOffer || !credRequest) {
      throw new AriesFrameworkError('Missing indy CredOffer or CredReq in createCredential')
    }

    const [credential, credentialRevocationId] = await this.indyIssuerService.createCredential({
      credentialOffer: credOffer,
      credentialRequest: credRequest,
      credentialValues: IndyCredentialUtils.convertAttributesToValues(credentialAttributes),
    })

    credentialRecord.metadata.add(CredentialMetadataKeys.IndyCredential, {
      indyCredentialRevocationId: credentialRevocationId,
      indyRevocationRegistryId: credential.rev_reg_id,
    })

    const format = new CredentialFormatSpec({
      attachId,
      format: INDY_CRED_ABSTRACT,
    })

    const attachment = this.getFormatData(credential, format.attachId)
    return { format, attachment }
  }

  /**
   * Processes an incoming credential - retrieve metadata, retrieve payload and store it in the Indy wallet
   * @param options the issue credential message wrapped inside this object
   * @param credentialRecord the credential exchange record for this credential
   */
  public async processCredential({ credentialRecord, attachment }: FormatProcessOptions): Promise<void> {
    const credentialRequestMetadata = credentialRecord.metadata.get(CredentialMetadataKeys.IndyRequest)

    if (!credentialRequestMetadata) {
      throw new CredentialProblemReportError(
        `Missing required request metadata for credential with id ${credentialRecord.id}`,
        { problemCode: CredentialProblemReportReason.IssuanceAbandoned }
      )
    }

    const indyCredential = attachment.getDataAsJson<Indy.Cred>()
    const credentialDefinition = await this.indyLedgerService.getCredentialDefinition(indyCredential.cred_def_id)
    const revocationRegistry = indyCredential.rev_reg_id
      ? await this.indyLedgerService.getRevocationRegistryDefinition(indyCredential.rev_reg_id)
      : null

    const credentialId = await this.indyHolderService.storeCredential({
      credentialId: uuid(),
      credentialRequestMetadata,
      credential: indyCredential,
      credentialDefinition,
      revocationRegistryDefinition: revocationRegistry?.revocationRegistryDefinition,
    })

    credentialRecord.credentials.push({
      credentialRecordType: 'indy',
      credentialRecordId: credentialId,
    })
  }

  public supportsFormat(format: string): boolean {
    const supportedFormats = [INDY_CRED_ABSTRACT, INDY_CRED_REQUEST, INDY_CRED_FILTER]

    return supportedFormats.includes(format)
  }

  /**
   * Gets the attachment object for a given attachId. We need to get out the correct attachId for
   * indy and then find the corresponding attachment (if there is one)
   * @param formats the formats object containing the attachId
   * @param messageAttachment the attachment containing the payload
   * @returns The Attachment if found or undefined
   *
   */
  public getAttachment(formats: CredentialFormatSpec[], messageAttachments: Attachment[]): Attachment | undefined {
    const supportedAttachmentIds = formats.filter((f) => this.supportsFormat(f.format)).map((f) => f.attachId)
    const supportedAttachments = messageAttachments.filter((attachment) =>
      supportedAttachmentIds.includes(attachment.id)
    )

    return supportedAttachments[0]
  }

  public async deleteCredentialById(credentialRecordId: string): Promise<void> {
    await this.indyHolderService.deleteCredential(credentialRecordId)
  }

  /**
   * Checks whether it should automatically respond to a proposal. Moved from CredentialResponseCoordinator
   * as this contains format-specific logic
   * @param credentialRecord The credential record for which we are testing whether or not to auto respond
   * @param agentConfig config object for the agent, used to hold auto accept state for the agent
   * @returns true if we should auto respond, false otherwise
   */

  public shouldAutoRespondToProposal(handlerOptions: HandlerAutoAcceptOptions): boolean {
    const autoAccept = composeAutoAccept(
      handlerOptions.credentialRecord.autoAcceptCredential,
      handlerOptions.autoAcceptType
    )

    if (autoAccept === AutoAcceptCredential.ContentApproved) {
      return (
        this.areProposalValuesValid(handlerOptions.credentialRecord, handlerOptions.messageAttributes) &&
        this.areProposalAndOfferDefinitionIdEqual(handlerOptions.proposalAttachment, handlerOptions.offerAttachment)
      )
    }
    return false
  }

  /**
   * Checks whether it should automatically respond to an indy request.
   *
   * @returns true if we should auto respond, false otherwise
   */
  public shouldAutoRespondToRequest(options: HandlerAutoAcceptOptions): boolean {
    const autoAccept = composeAutoAccept(options.credentialRecord.autoAcceptCredential, options.autoAcceptType)

    if (!options.requestAttachment) {
      throw new AriesFrameworkError(`Missing Request Attachment for Credential Record ${options.credentialRecord.id}`)
    }
    if (autoAccept === AutoAcceptCredential.ContentApproved) {
      return this.isRequestDefinitionIdValid(
        options.requestAttachment,
        options.offerAttachment,
        options.proposalAttachment
      )
    }
    return false
  }

  /**
   * Checks whether it should automatically respond to a request. Moved from CredentialResponseCoordinator
   * as this contains format-specific logic
   * @param credentialRecord The credential record for which we are testing whether or not to auto respond
   * @param autoAcceptType auto accept type for this credential exchange - normal auto or content approved
   * @returns true if we should auto respond, false otherwise
   */

  public shouldAutoRespondToCredential(options: HandlerAutoAcceptOptions): boolean {
    const autoAccept = composeAutoAccept(options.credentialRecord.autoAcceptCredential, options.autoAcceptType)

    if (autoAccept === AutoAcceptCredential.ContentApproved) {
      if (options.credentialAttachment) {
        return this.areCredentialValuesValid(options.credentialRecord, options.credentialAttachment)
      }
    }
    return false
  }

  private async createIndyOffer({
    credentialRecord,
    attachId,
    credentialDefinitionId,
    attributes,
  }: {
    credentialDefinitionId: string
    credentialRecord: CredentialExchangeRecord
    attachId?: string
    attributes: CredentialPreviewAttributeOptions[]
  }): Promise<FormatCreateOfferReturn> {
    // if the proposal has an attachment Id use that, otherwise the generated id of the formats object
    const format = new CredentialFormatSpec({
      attachId: attachId,
      format: INDY_CRED_ABSTRACT,
    })

    const offer = await this.indyIssuerService.createCredentialOffer(credentialDefinitionId)

    const previewAttributes = attributes.map((attribute) => new CredentialPreviewAttribute(attribute))
    await this.assertPreviewAttributesMatchSchemaAttributes(offer, previewAttributes)

    credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
      schemaId: credOffer.schema_id,
      credentialDefinitionId: credOffer.cred_def_id,
    })

    const attachment = this.getFormatData(offer, format.attachId)

    return { format, attachment, previewAttributes }
  }

  private async getIndyHolderDid(credentialRecord: CredentialExchangeRecord) {
    // If we have a connection id we try to extract the did from the connection did document.
    if (credentialRecord.connectionId) {
      const connection = await this.connectionService.getById(credentialRecord.connectionId)
      if (!connection.did) {
        throw new AriesFrameworkError(`Connection record ${connection.id} has no 'did'`)
      }
      const resolved = await this.didResolver.resolve(connection.did)

      if (resolved.didDocument) {
        const verificationMethod = await findVerificationMethodByKeyType(
          'Ed25519VerificationKey2018',
          resolved.didDocument
        )

        if (verificationMethod) {
          return getIndyDidFromVerificationMethod(verificationMethod)
        }
      }
    }

    // If it wasn't successful to extract the did from the connection, we'll create a new key (e.g. if using connection-less)
    // FIXME: we already create a did for the exchange when using connection-less, but this is on a higher level. We should look at
    // a way to reuse this key, but for now this is easier.
    const { did } = await this.wallet.createDid()

    return did
  }

  /**
   * Get linked attachments for indy format from a proposal message. This allows attachments
   * to be copied across to old style credential records
   *
   * @param options ProposeCredentialOptions object containing (optionally) the linked attachments
   * @return array of linked attachments or undefined if none present
   */
  private getCredentialLinkedAttachments(indyProposeFormat: IndyProposeCredentialFormat): {
    attachments?: Attachment[]
    previewAttributes?: CredentialPreviewAttribute[]
  } {
    if (!indyProposeFormat.linkedAttachments && !indyProposeFormat.attributes) {
      return {}
    }

    let previewAttributes =
      indyProposeFormat.attributes?.map((attribute) => new CredentialPreviewAttribute(attribute)) ?? []

    let attachments: Attachment[] | undefined

    if (indyProposeFormat.linkedAttachments) {
      // there are linked attachments so transform into the attribute field of the CredentialPreview object for
      // this proposal
      previewAttributes = IndyCredentialUtils.createAndLinkAttachmentsToPreview(
        indyProposeFormat.linkedAttachments,
        previewAttributes
      )
      attachments = indyProposeFormat.linkedAttachments.map((linkedAttachment) => linkedAttachment.attachment)
    }

    return { attachments, previewAttributes }
  }

  private areProposalValuesValid(
    credentialRecord: CredentialExchangeRecord,
    proposeMessageAttributes?: CredentialPreviewAttribute[]
  ) {
    const { credentialAttributes } = credentialRecord

    if (proposeMessageAttributes && credentialAttributes) {
      const proposeValues = IndyCredentialUtils.convertAttributesToValues(proposeMessageAttributes)
      const defaultValues = IndyCredentialUtils.convertAttributesToValues(credentialAttributes)
      if (IndyCredentialUtils.checkValuesMatch(proposeValues, defaultValues)) {
        return true
      }
    }
    return false
  }

  private areProposalAndOfferDefinitionIdEqual(proposalAttachment?: Attachment, offerAttachment?: Attachment) {
    const credOffer = offerAttachment?.getDataAsJson<Indy.CredOffer>()
    let credPropose = proposalAttachment?.getDataAsJson<IndyCredPropose>()
    credPropose = JsonTransformer.fromJSON(credPropose, IndyCredPropose)

    const proposalCredentialDefinitionId = credPropose?.credentialDefinitionId
    const offerCredentialDefinitionId = credOffer?.cred_def_id
    return proposalCredentialDefinitionId === offerCredentialDefinitionId
  }

  private areCredentialValuesValid(credentialRecord: CredentialExchangeRecord, credentialAttachment: Attachment) {
    const indyCredential = credentialAttachment.getDataAsJson<Indy.Cred>()

    if (!indyCredential) {
      new AriesFrameworkError(`Missing required base64 encoded attachment data for credential`)
      return false
    }

    const credentialMessageValues = indyCredential.values

    if (credentialRecord.credentialAttributes) {
      const defaultValues = IndyCredentialUtils.convertAttributesToValues(credentialRecord.credentialAttributes)

      if (IndyCredentialUtils.checkValuesMatch(credentialMessageValues, defaultValues)) {
        return true
      }
    }
    return false
  }

  private async assertPreviewAttributesMatchSchemaAttributes(
    offer: Indy.CredOffer,
    attributes: CredentialPreviewAttribute[]
  ): Promise<void> {
    const schema = await this.indyLedgerService.getSchema(offer.schema_id)

    IndyCredentialUtils.checkAttributesMatch(schema, attributes)
  }

  private isRequestDefinitionIdValid(
    requestAttachment: Attachment,
    offerAttachment?: Attachment,
    proposeAttachment?: Attachment
  ) {
    const indyCredentialRequest = requestAttachment?.getDataAsJson<Indy.CredReq>()
    let indyCredentialProposal = proposeAttachment?.getDataAsJson<IndyCredPropose>()
    indyCredentialProposal = JsonTransformer.fromJSON(indyCredentialProposal, IndyCredPropose)

    const indyCredentialOffer = offerAttachment?.getDataAsJson<Indy.CredOffer>()

    if (indyCredentialProposal || indyCredentialOffer) {
      const previousCredentialDefinitionId =
        indyCredentialOffer?.cred_def_id ?? indyCredentialProposal?.credentialDefinitionId

      if (previousCredentialDefinitionId === indyCredentialRequest.cred_def_id) {
        return true
      }
      return false
    }
    return false
  }
}
