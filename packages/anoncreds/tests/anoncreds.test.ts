import { Agent, KeyDerivationMethod } from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'

import { AnonCredsModule } from '../src'

import { InMemoryAnonCredsRegistry } from './InMemoryAnonCredsRegistry'

const agent = new Agent({
  config: {
    label: '@aries-framework/anoncreds',
    walletConfig: {
      id: '@aries-framework/anoncreds',
      key: 'CwNJroKHTSSj3XvE7ZAnuKiTn2C4QkFvxEqfm5rzhNrb',
      keyDerivationMethod: KeyDerivationMethod.Raw,
    },
  },
  modules: {
    anonCreds: new AnonCredsModule({
      registries: [new InMemoryAnonCredsRegistry()],
    }),
  },
  dependencies: agentDependencies,
})

describe('anoncreds', () => {
  beforeEach(async () => {
    await agent.initialize()
  })

  afterEach(async () => {
    await agent.wallet.delete()
    await agent.shutdown()
  })

  test('', async () => {
    await agent.modules.anonCreds.registerSchema({
      options: {},
      schema: {
        attrNames: ['one', 'two'],
        issuerId: 'internal:first',
        name: 'Test Schema',
        version: '1.0.0',
      },
    })
  })
})
