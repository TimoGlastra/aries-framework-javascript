import type { InboundMessageContext } from '../../../agent/models/InboundMessageContext'
import type { TrustPingMessage } from '../messages'

import { Lifecycle, scoped } from 'tsyringe'

import { TrustPingResponseMessage } from '../messages'

@scoped(Lifecycle.ContainerScoped)
export class TrustPingService {
  public processPing(messageContext: InboundMessageContext<TrustPingMessage>) {
    if (messageContext.message.responseRequested) {
      const response = new TrustPingResponseMessage({
        threadId: messageContext.message.id,
      })

      return response
    }
  }
}
