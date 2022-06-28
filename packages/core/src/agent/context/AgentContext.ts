import type { DependencyManager } from '../../plugins'
import type { Wallet } from '../../wallet'
import type { AgentConfig } from '../AgentConfig'

export interface AgentContext {
  readonly wallet: Wallet
  readonly config: AgentConfig
  readonly dependencyManager: DependencyManager

  /**
   * An identifier that allows to correlate this context across usages. An example of the contextCorrelationId could be
   * the id of the `TenantRecord` that is associated with this context. The AgentContextProvider can use this identifier to
   * correlate an inbound message to a specific context (if the message is not encrypted, it's impossible to correlate it to a tenant)
   */
  readonly contextCorrelationId: string
}
