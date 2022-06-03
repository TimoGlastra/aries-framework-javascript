import type { AgentConfig } from '../../../../../agent/AgentConfig'
import type { Handler, HandlerInboundMessage } from '../../../../../agent/Handler'
import type { DidCommMessageRepository } from '../../../../../storage'
import type { HandlerAutoAcceptOptions } from '../../../formats/CredentialFormatServiceOptions'
import type { CredentialExchangeRecord } from '../../../repository/CredentialExchangeRecord'
import type { V1CredentialService } from '../V1CredentialService'

import { createOutboundMessage } from '../../../../../agent/helpers'
import { INDY_CREDENTIAL_OFFER_ATTACHMENT_ID, V1OfferCredentialMessage, V1ProposeCredentialMessage } from '../messages'

export class V1ProposeCredentialHandler implements Handler {
  private credentialService: V1CredentialService
  private agentConfig: AgentConfig
  private didCommMessageRepository: DidCommMessageRepository
  public supportedMessages = [V1ProposeCredentialMessage]

  public constructor(
    credentialService: V1CredentialService,
    agentConfig: AgentConfig,
    didCommMessageRepository: DidCommMessageRepository
  ) {
    this.credentialService = credentialService
    this.agentConfig = agentConfig
    this.didCommMessageRepository = didCommMessageRepository
  }

  public async handle(messageContext: HandlerInboundMessage<V1ProposeCredentialHandler>) {
    const credentialRecord = await this.credentialService.processProposal(messageContext)

    const proposalMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V1ProposeCredentialMessage,
    })

    const offerMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V1OfferCredentialMessage,
    })

    const proposalValues = proposalMessage?.credentialProposal?.attributes
    const offerAttachment = offerMessage?.getAttachmentById(INDY_CREDENTIAL_OFFER_ATTACHMENT_ID)

    const handlerOptions: HandlerAutoAcceptOptions = {
      credentialRecord,
      autoAcceptType: this.agentConfig.autoAcceptCredentials,
      messageAttributes: proposalValues,
      offerAttachment,
      credentialDefinitionId: proposalMessage?.credentialDefinitionId,
    }
    if (await this.credentialService.shouldAutoRespondToProposal(handlerOptions)) {
      return await this.acceptProposal(credentialRecord, messageContext, proposalMessage)
    }
  }

  private async acceptProposal(
    credentialRecord: CredentialExchangeRecord,
    messageContext: HandlerInboundMessage<V1ProposeCredentialHandler>,
    proposalMessage: V1ProposeCredentialMessage | null
  ) {
    this.agentConfig.logger.info(
      `Automatically sending offer with autoAccept on ${this.agentConfig.autoAcceptCredentials}`
    )

    if (!messageContext.connection) {
      this.agentConfig.logger.error('No connection on the messageContext, aborting auto accept')
      return
    }

    if (!proposalMessage?.credentialProposal) {
      this.agentConfig.logger.error(
        `Proposal message with id ${credentialRecord.id} is missing required credential proposal`
      )
      return
    }

    if (!proposalMessage.credentialDefinitionId) {
      this.agentConfig.logger.error('Missing required credential definition id')
      return
    }

    const { message } = await this.credentialService.acceptProposal({
      credentialRecord,
    })

    return createOutboundMessage(messageContext.connection, message)
  }
}
