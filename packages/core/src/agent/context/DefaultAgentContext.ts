import type { Wallet } from '../../wallet'
import type { AgentConfig } from '../AgentConfig'
import type { AgentContext } from './AgentContext'

export class DefaultAgentContext implements AgentContext {
  public readonly wallet: Wallet
  public readonly config: AgentConfig
  public readonly contextCorrelationId: string

  public constructor(wallet: Wallet, config: AgentConfig, contextCorrelationId: string) {
    this.wallet = wallet
    this.config = config
    this.contextCorrelationId = contextCorrelationId
  }
}
