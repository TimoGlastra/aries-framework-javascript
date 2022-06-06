import type { AgentConfig } from '../../../../../agent/AgentConfig'
import type { Handler, HandlerInboundMessage } from '../../../../../agent/Handler'
import type { InboundMessageContext } from '../../../../../agent/models/InboundMessageContext'
import type { DidCommMessageRepository } from '../../../../../storage'
import type { MediationRecipientService } from '../../../../routing/services/MediationRecipientService'
import type { CredentialExchangeRecord } from '../../../repository/CredentialExchangeRecord'
import type { V2CredentialService } from '../V2CredentialService'

import { createOutboundMessage, createOutboundServiceMessage } from '../../../../../agent/helpers'
import { ServiceDecorator } from '../../../../../decorators/service/ServiceDecorator'
import { AriesFrameworkError } from '../../../../../error/AriesFrameworkError'
import { DidCommMessageRole } from '../../../../../storage'
import { V2OfferCredentialMessage } from '../messages/V2OfferCredentialMessage'
import { V2ProposeCredentialMessage } from '../messages/V2ProposeCredentialMessage'

export class V2OfferCredentialHandler implements Handler {
  private credentialService: V2CredentialService
  private agentConfig: AgentConfig
  private mediationRecipientService: MediationRecipientService
  public supportedMessages = [V2OfferCredentialMessage]
  private didCommMessageRepository: DidCommMessageRepository

  public constructor(
    credentialService: V2CredentialService,
    agentConfig: AgentConfig,
    mediationRecipientService: MediationRecipientService,
    didCommMessageRepository: DidCommMessageRepository
  ) {
    this.credentialService = credentialService
    this.agentConfig = agentConfig
    this.mediationRecipientService = mediationRecipientService
    this.didCommMessageRepository = didCommMessageRepository
  }

  public async handle(messageContext: InboundMessageContext<V2OfferCredentialMessage>) {
    const credentialRecord = await this.credentialService.processOffer(messageContext)

    const offerMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V2OfferCredentialMessage,
    })

    const proposeMessage = await this.didCommMessageRepository.findAgentMessage({
      associatedRecordId: credentialRecord.id,
      messageClass: V2ProposeCredentialMessage,
    })

    if (!offerMessage) {
      throw new AriesFrameworkError('Missing offer message in V2OfferCredentialHandler')
    }

    const shouldAutoRespond = this.credentialService.shouldAutoRespondToOffer(
      credentialRecord,
      offerMessage,
      proposeMessage ?? undefined
    )

    if (shouldAutoRespond) {
      return await this.acceptOffer(credentialRecord, messageContext, offerMessage)
    }
  }

  private async acceptOffer(
    credentialRecord: CredentialExchangeRecord,
    messageContext: HandlerInboundMessage<V2OfferCredentialHandler>,
    offerMessage?: V2OfferCredentialMessage
  ) {
    this.agentConfig.logger.info(
      `Automatically sending request with autoAccept on ${this.agentConfig.autoAcceptCredentials}`
    )

    if (messageContext.connection) {
      const { message } = await this.credentialService.acceptOffer({
        credentialRecord,
      })
      return createOutboundMessage(messageContext.connection, message)
    } else if (offerMessage?.service) {
      const routing = await this.mediationRecipientService.getRouting()
      const ourService = new ServiceDecorator({
        serviceEndpoint: routing.endpoints[0],
        recipientKeys: [routing.recipientKey.publicKeyBase58],
        routingKeys: routing.routingKeys.map((key) => key.publicKeyBase58),
      })
      const recipientService = offerMessage.service

      const { message } = await this.credentialService.acceptOffer({
        credentialRecord,
      })

      // Set and save ~service decorator to record (to remember our verkey)
      message.service = ourService

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
