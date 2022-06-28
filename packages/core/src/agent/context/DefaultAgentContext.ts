import type { DependencyManager } from '../../plugins'
import type { Wallet } from '../../wallet'
import type { AgentConfig } from '../AgentConfig'
import type { AgentContext } from './AgentContext'

export class DefaultAgentContext implements AgentContext {
  public readonly wallet: Wallet
  public readonly config: AgentConfig
  public readonly dependencyManager: DependencyManager
  public readonly contextCorrelationId: string

  public constructor({
    wallet,
    config,
    contextCorrelationId,
    dependencyManager,
  }: {
    wallet: Wallet
    config: AgentConfig
    contextCorrelationId: string
    dependencyManager: DependencyManager
  }) {
    this.wallet = wallet
    this.config = config
    this.dependencyManager = dependencyManager
    this.contextCorrelationId = contextCorrelationId
  }
}
