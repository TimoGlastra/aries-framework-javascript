import type { Handler } from '../../../agent/Handler'

import { TrustPingResponseMessage } from '../messages'

export class TrustPingResponseMessageHandler implements Handler {
  public supportedMessages = [TrustPingResponseMessage]

  public async handle() {
    // nothing to do when trust ping response is received
  }
}
