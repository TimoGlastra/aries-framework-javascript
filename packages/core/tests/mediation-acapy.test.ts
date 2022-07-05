import { LogLevel, HttpOutboundTransport, Agent, WsOutboundTransport } from '../src'

import { agentDependencies } from './helpers'
import { TestLogger } from './logger'

describe('mediation acapy', () => {
  test('mediatino timeout', async () => {
    const invitationUrl =
      'https://http.mediator.community.animo.id?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNjY0NjA4NTEtYWUxYi00MTBlLTk1NzAtNWE0YjgzZDRkYjhkIiwgImxhYmVsIjogIkFuaW1vIENvbW11bml0eSBNZWRpYXRvciIsICJyZWNpcGllbnRLZXlzIjogWyJEN25BbnRRSmJCUUtIODhuV1lpSGFCcmdhc0tYdE5ZUHN1aWZ0djh6d2dIZyJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHBzOi8vaHR0cC5tZWRpYXRvci5jb21tdW5pdHkuYW5pbW8uaWQifQ=='

    const agent = new Agent(
      {
        label: 'test',
        walletConfig: {
          id: 'test',
          key: 'test',
        },
        mediatorConnectionsInvite: invitationUrl,
        logger: new TestLogger(LogLevel.debug),
      },
      agentDependencies
    )

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()

    await agent.wallet.delete()
    await agent.shutdown()
  })
})
