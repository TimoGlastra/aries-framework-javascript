import type { AgentContext } from '@aries-framework/core'

import { BaseAgent } from '@aries-framework/core'

export class TenantAgent extends BaseAgent {
  public constructor(agentContext: AgentContext) {
    super(agentContext.config, agentContext.dependencyManager)
  }

  protected registerDependencies() {
    // Nothing to do here
  }
}
