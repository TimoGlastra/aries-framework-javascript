import type { AgentContextProvider } from '../AgentContextProvider'

import { getAgentConfig } from '../../../../tests/helpers'
import { MockAgentContext } from '../../../../tests/mocks'
import { DefaultAgentContextProvider } from '../DefaultAgentContextProvider'

const agentConfig = getAgentConfig('DefaultAgentContextProvider')

describe('DefaultAgentContextProvider', () => {
  describe('getContextForInboundMessage()', () => {
    test('returns the agent context provided in the constructor', async () => {
      const agentContext = new MockAgentContext(agentConfig)
      const agentContextProvider: AgentContextProvider = new DefaultAgentContextProvider(agentContext)

      const message = {}

      await expect(agentContextProvider.getContextForInboundMessage(message)).resolves.toBe(agentContext)
    })
  })
})
