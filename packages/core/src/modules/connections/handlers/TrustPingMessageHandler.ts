import type { Handler, HandlerInboundMessage } from '../../../agent/Handler'
import type { TrustPingService } from '../services/TrustPingService'

import { createOutboundMessage } from '../../../agent/helpers'
import { TrustPingMessage } from '../messages'

export class TrustPingMessageHandler implements Handler {
  private trustPingService: TrustPingService
  public supportedMessages = [TrustPingMessage]

  public constructor(trustPingService: TrustPingService) {
    this.trustPingService = trustPingService
  }

  public async handle(messageContext: HandlerInboundMessage<TrustPingMessageHandler>) {
    const connection = messageContext.assertReadyConnection()
    const pingResponse = this.trustPingService.processPing(messageContext)

    if (pingResponse) {
      return createOutboundMessage(connection, pingResponse)
    }
  }
}
