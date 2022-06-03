import type { AgentConfig } from '../../../../../agent/AgentConfig'
import type { Handler, HandlerInboundMessage } from '../../../../../agent/Handler'
import type { DidCommMessageRepository } from '../../../../../storage'
import type { HandlerAutoAcceptOptions } from '../../../formats/CredentialFormatServiceOptions'
import type { CredentialExchangeRecord } from '../../../repository/CredentialExchangeRecord'
import type { V1CredentialService } from '../V1CredentialService'

import { createOutboundMessage, createOutboundServiceMessage } from '../../../../../agent/helpers'
import { DidCommMessageRole } from '../../../../../storage'
import {
  V1RequestCredentialMessage,
  V1OfferCredentialMessage,
  INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
  INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
} from '../messages'

export class V1RequestCredentialHandler implements Handler {
  private agentConfig: AgentConfig
  private credentialService: V1CredentialService
  private didCommMessageRepository: DidCommMessageRepository
  public supportedMessages = [V1RequestCredentialMessage]

  public constructor(
    credentialService: V1CredentialService,
    agentConfig: AgentConfig,
    didCommMessageRepository: DidCommMessageRepository
  ) {
    this.credentialService = credentialService
    this.agentConfig = agentConfig
    this.didCommMessageRepository = didCommMessageRepository
  }

  public async handle(messageContext: HandlerInboundMessage<V1RequestCredentialHandler>) {
    const credentialRecord = await this.credentialService.processRequest(messageContext)

    const requestMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V1RequestCredentialMessage,
    })

    const offerMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V1OfferCredentialMessage,
    })

    const formatService = this.credentialService.getFormatService('indy')

    // T-TODO: v1 doesn't have an attachment for proposals
    const proposalAttachment = undefined
    const offerAttachment = offerMessage?.getAttachmentById(INDY_CREDENTIAL_OFFER_ATTACHMENT_ID)
    const requestAttachment = requestMessage?.getAttachmentById(INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID)

    const handlerOptions: HandlerAutoAcceptOptions = {
      credentialRecord,
      autoAcceptType: this.agentConfig.autoAcceptCredentials,
      proposalAttachment,
      offerAttachment,
      requestAttachment,
    }

    if (formatService.shouldAutoRespondToRequest(handlerOptions)) {
      return await this.acceptRequest(credentialRecord, messageContext, offerMessage, requestMessage)
    }
  }

  private async acceptRequest(
    credentialRecord: CredentialExchangeRecord,
    messageContext: HandlerInboundMessage<V1RequestCredentialHandler>,
    offerMessage?: V1OfferCredentialMessage | null,
    requestMessage?: V1RequestCredentialMessage | null
  ) {
    this.agentConfig.logger.info(
      `Automatically sending credential with autoAccept on ${this.agentConfig.autoAcceptCredentials}`
    )

    const { message } = await this.credentialService.acceptRequest({
      credentialRecord,
    })

    if (messageContext.connection) {
      return createOutboundMessage(messageContext.connection, message)
    } else if (requestMessage?.service && offerMessage?.service) {
      const recipientService = requestMessage.service
      const ourService = offerMessage.service

      // Set ~service, update message in record (for later use)
      message.setService(ourService)

      await this.didCommMessageRepository.saveOrUpdateAgentMessage({
        agentMessage: message,
        role: DidCommMessageRole.Sender,
        associatedRecordId: credentialRecord.id,
      })

      return createOutboundServiceMessage({
        payload: message,
        service: recipientService.resolvedDidCommService,
        senderKey: ourService.resolvedDidCommService.recipientKeys[0],
      })
    }

    this.agentConfig.logger.error(`Could not automatically create credential request`)
  }
}
