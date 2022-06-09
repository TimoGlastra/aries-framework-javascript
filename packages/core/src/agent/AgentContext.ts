import type { Wallet } from '../wallet'
import type { AgentConfig } from './AgentConfig'

export interface AgentContext {
  wallet: Wallet
  config: AgentConfig
}

export class DefaultAgentContext implements AgentContext {
  public readonly wallet: Wallet
  public readonly config: AgentConfig

  public constructor(wallet: Wallet, config: AgentConfig) {
    this.wallet = wallet
    this.config = config
  }
}
