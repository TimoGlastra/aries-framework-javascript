import type { ConnectionRecord, ConnectionStateChangedEvent } from '@aries-framework/core'

import {
  DidExchangeState,
  Agent,
  ConnectionEventTypes,
  ConsoleLogger,
  DependencyManager,
  HttpOutboundTransport,
  LogLevel,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'

import { TenantsModule } from '../src'

jest.setTimeout(2000000)

describe('tenants', () => {
  test('create tenant', async () => {
    // Register tenant module. For now we need to create a custom dependency manager
    // and register all plugins before initializing the agent. Later, we can add the module registration
    // to the agent constructor.
    const dependencyManager = new DependencyManager()
    dependencyManager.registerModulePlugins(TenantsModule)

    // Create base agent
    const agent = new Agent(
      {
        label: 'tenants',
        walletConfig: {
          id: 'Wallet: tenants',
          key: 'Wallet: tenants',
        },
        logger: new ConsoleLogger(LogLevel.trace),
        endpoints: ['http://localhost:3000'],
        autoAcceptConnections: true,
      },
      agentDependencies,
      dependencyManager
    )

    agent.registerInboundTransport(new HttpInboundTransport({ port: 3000 }))
    agent.registerOutboundTransport(new HttpOutboundTransport())

    const tenantModule = agent.dependencyManager.resolve(TenantsModule)
    await agent.initialize()

    // Create tenant and get tenant agent
    const tenantRecord1 = await tenantModule.createTenant({
      config: {
        label: 'Tenant 1',
      },
    })

    const tenantAgent1 = await tenantModule.getTenantAgent({
      tenantId: tenantRecord1.id,
    })

    // Create tenant and get tenant agent
    const tenantRecord2 = await tenantModule.createTenant({
      config: {
        label: 'Tenant 2',
      },
    })

    const tenantAgent2 = await tenantModule.getTenantAgent({
      tenantId: tenantRecord2.id,
    })

    // Create oob invitation in scope of tenant
    const outOfBandRecord = await tenantAgent1.oob.createInvitation()

    const { connectionRecord } = await tenantAgent2.oob.receiveInvitation(outOfBandRecord.outOfBandInvitation)

    console.log(connectionRecord)

    // Retrieve all oob records for the base and tenant agent, only the
    // tenant agent should have a record.
    const baseAgentOutOfBandRecords = await agent.oob.getAll()
    const tenantAgent1OutOfBandRecords = await tenantAgent1.oob.getAll()
    const tenantAgent2OutOfBandRecords = await tenantAgent2.oob.getAll()

    expect(baseAgentOutOfBandRecords.length).toBe(0)
    expect(tenantAgent1OutOfBandRecords.length).toBe(1)
    expect(tenantAgent2OutOfBandRecords.length).toBe(1)

    const a = await tenantAgent2.connections.returnWhenIsConnected(connectionRecord!.id)
    console.log('READY!!', a)

    await new Promise((res) => setTimeout(res, 5000))

    await tenantAgent1.shutdown()
    await tenantAgent2.shutdown()
    await agent.shutdown()
  })

  test('external', async () => {
    // Register tenant module. For now we need to create a custom dependency manager
    // and register all plugins before initializing the agent. Later, we can add the module registration
    // to the agent constructor.
    const dependencyManager = new DependencyManager()
    dependencyManager.registerModulePlugins(TenantsModule)

    // Create base agent
    const agent = new Agent(
      {
        label: 'tenants',
        walletConfig: {
          id: 'Wallet: tenants',
          key: 'Wallet: tenants',
        },
        logger: new ConsoleLogger(LogLevel.trace),
        endpoints: ['https://c79282ee2d3c.ngrok.io'],
        autoAcceptConnections: true,
        useLegacyDidSovPrefix: true,
      },
      agentDependencies,
      dependencyManager
    )

    agent.registerInboundTransport(new HttpInboundTransport({ port: 3000 }))
    agent.registerOutboundTransport(new HttpOutboundTransport())

    const tenantModule = agent.dependencyManager.resolve(TenantsModule)
    await agent.initialize()

    // Create tenant and get tenant agent
    const tenantRecord1 = await tenantModule.createTenant({
      config: {
        label: 'Tenant 1',
      },
    })

    const tenantAgent1 = await tenantModule.getTenantAgent({
      tenantId: tenantRecord1.id,
    })

    // Create oob invitation in scope of tenant
    const { invitation, outOfBandRecord } = await tenantAgent1.oob.createLegacyInvitation()

    console.log(invitation.toUrl({ domain: 'didcomm://invitation', useLegacyDidSovPrefix: true }))

    const waitForConnection = () =>
      new Promise<ConnectionRecord>((resolve) =>
        agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, (event) => {
          if (
            event.payload.connectionRecord.outOfBandId === outOfBandRecord.id &&
            event.payload.connectionRecord.state === DidExchangeState.Completed
          )
            resolve(event.payload.connectionRecord)
        })
      )

    await waitForConnection()

    await tenantAgent1.shutdown()
    await agent.shutdown()
  })
})
