import type { Agent } from '../agent/Agent'

export interface InboundTransport {
  // biome-ignore lint/suspicious/noExplicitAny:
  start(agent: Agent<any>): Promise<void>
  stop(): Promise<void>
}
