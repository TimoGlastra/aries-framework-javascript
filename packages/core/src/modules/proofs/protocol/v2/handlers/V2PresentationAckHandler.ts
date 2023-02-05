import type { MessageHandler, MessageHandlerInboundMessage } from '../../../../../agent/MessageHandler'
import type { ProofProtocol } from '../../ProofProtocol'

import { V2PresentationAckMessage } from '../messages'

export class V2PresentationAckHandler implements MessageHandler {
  private proofService: ProofProtocol
  public supportedMessages = [V2PresentationAckMessage]

  public constructor(proofService: ProofProtocol) {
    this.proofService = proofService
  }

  public async handle(messageContext: MessageHandlerInboundMessage<V2PresentationAckHandler>) {
    await this.proofService.processAck(messageContext)
  }
}
