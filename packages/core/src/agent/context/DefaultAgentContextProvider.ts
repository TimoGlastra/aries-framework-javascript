import type { AgentContextProvider } from './AgentContextProvider'

import { InjectionSymbols } from '../../constants'
import { inject, injectable } from '../../plugins'

import { AgentContext } from './AgentContext'

/**
 * Default implementation of AgentContextProvider.
 *
 * Holds a single `AgentContext` instance that will be used for all messages, i.e. a
 * a single tenant agent.
 */
@injectable()
export class DefaultAgentContextProvider implements AgentContextProvider {
  private agentContext: AgentContext

  public constructor(@inject(InjectionSymbols.AgentContext) agentContext: AgentContext) {
    this.agentContext = agentContext
  }

  public async getAgentContextForContextCorrelationId(contextCorrelationId: string): Promise<AgentContext> {
    // FIXME: what is the default context correlation id?
    return this.agentContext
  }

  public async getContextForInboundMessage(): Promise<AgentContext> {
    return this.agentContext
  }
}
