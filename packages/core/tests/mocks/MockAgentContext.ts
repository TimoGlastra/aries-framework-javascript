import type { Wallet, AgentConfig } from '../../src'
import type { AgentContext } from '../../src/agent'

import { DependencyManager } from '../../src'

import { MockWallet } from './MockWallet'

export class MockAgentContext implements AgentContext {
  public wallet: Wallet
  public config: AgentConfig
  public contextCorrelationId = 'mock'
  // TODO: does this work?
  public dependencyManager = new DependencyManager()

  public constructor(config: AgentConfig, wallet?: Wallet) {
    this.wallet = wallet ?? new MockWallet()
    this.config = config
  }
}
