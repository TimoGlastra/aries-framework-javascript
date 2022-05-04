import type { OutboundMessage, OutboundServiceMessage } from '../types'
import type { AgentMessage } from './AgentMessage'
import type { InboundMessageContext } from './models/InboundMessageContext'

export interface Handler<T extends typeof AgentMessage = typeof AgentMessage> {
  readonly supportedMessages: readonly T[]

  handle(messageContext: InboundMessageContext): Promise<OutboundMessage | OutboundServiceMessage | void>
}

/**
 * Provides exact typing for the AgentMessage in the message context in the `handle` function
 * of a handler. It takes all possible types from `supportedMessageTypes`
 *
 * @example
 * ```ts
 * class MyHandler implements Handler {
 *  public async handle(messageContext: HandlerInboundMessage<BasicMessageHandler>) {
 *    // method implementation
 *  }
 * ```
 */
export type HandlerInboundMessage<H extends Handler> = InboundMessageContext<
  InstanceType<H['supportedMessages'][number]>
>
