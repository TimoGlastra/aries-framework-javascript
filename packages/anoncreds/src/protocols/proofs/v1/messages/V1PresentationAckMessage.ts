import type { AckMessageOptions } from '@aries-framework/core'

import { AckMessage, IsValidMessageType, parseMessageType } from '@aries-framework/core'

export class V1PresentationAckMessage extends AckMessage {
  public readonly allowDidSovPrefix = true

  @IsValidMessageType(V1PresentationAckMessage.type)
  public readonly type = V1PresentationAckMessage.type.messageTypeUri
  public static readonly type = parseMessageType('https://didcomm.org/present-proof/1.0/ack')
}
