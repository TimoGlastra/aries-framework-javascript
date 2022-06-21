import type { AgentContext } from './AgentContext'
import type { AgentContextProvider } from './AgentContextProvider'

/**
 * Default implementation of AgentContextProvider.
 *
 * Holds a single `AgentContext` instance that will be used for all messages, i.e. a
 * a single tenant agent.
 */
export class DefaultAgentContextProvider implements AgentContextProvider {
  private agentContext: AgentContext

  public constructor(agentContext: AgentContext) {
    this.agentContext = agentContext
  }

  public async getContextForInboundMessage(): Promise<AgentContext> {
    return this.agentContext
  }
}
