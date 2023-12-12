import type { Agent } from '../agent/Agent'
import type { OutboundPackage } from '../types'

export interface OutboundTransport {
  supportedSchemes: string[]

  sendMessage(outboundPackage: OutboundPackage): Promise<void>

  // biome-ignore lint/suspicious/noExplicitAny:
  start(agent: Agent<any>): Promise<void>
  stop(): Promise<void>
}
