import type { SovDidCreateOptions, Wallet } from '../src'

import { SubjectInboundTransport } from '../../../tests/transport/SubjectInboundTransport'
import { SubjectOutboundTransport } from '../../../tests/transport/SubjectOutboundTransport'
import { Agent } from '../../core/src/agent/Agent'
import { AgentEventTypes, InjectionSymbols } from '../src'

import { getAgentOptions } from './helpers'

describe('Public did connections', () => {
  let aliceAgent: Agent
  let faberAgent: Agent

  beforeEach(async () => {
    const aliceInboundTransport = new SubjectInboundTransport()
    const faberInboundTransport = new SubjectInboundTransport()

    const subjectMap = {
      'rxjs:faber': faberInboundTransport.ourSubject,
      'rxjs:alice': aliceInboundTransport.ourSubject,
    }
    const aliceAgentOptions = getAgentOptions('Manual Connection Flow Alice', {
      label: 'alice',
      autoAcceptConnections: true,
      endpoints: ['rxjs:alice'],
    })
    const faberAgentOptions = getAgentOptions('Manual Connection Flow Faber', {
      autoAcceptConnections: true,
      endpoints: ['rxjs:faber'],
    })

    aliceAgent = new Agent(aliceAgentOptions)
    aliceAgent.registerInboundTransport(aliceInboundTransport)
    aliceAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))

    faberAgent = new Agent(faberAgentOptions)
    faberAgent.registerInboundTransport(faberInboundTransport)
    faberAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))

    await aliceAgent.initialize()
    await faberAgent.initialize()
  })

  afterEach(async () => {
    await aliceAgent.wallet.delete()
    await aliceAgent.shutdown()

    await faberAgent.wallet.delete()
    await faberAgent.shutdown()
  })

  test('can create a connection using an existing did:sov did, while the other agent creates a new did:peer did', async () => {
    // FIXME: we need a better way to get the endorser did...
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')

    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)
    const [faberConnectionRecord] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)

    expect(aliceConnectionRecord).toBeConnectedWith(faberConnectionRecord)
    expect(aliceConnectionRecord?.theirDid).toContain('did:sov:')
  })

  test('can create a connection with both parties using an existing did:sov did', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did
    const aliceEndorserDid = aliceAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const aliceDidResult = await aliceAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'alice',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${aliceEndorserDid!}`,
        endpoints: {
          endpoint: aliceAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      {
        routing: {
          did: aliceDidResult.didState.did,
        },
      }
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')

    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)
    const [faberConnectionRecord] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)

    expect(aliceConnectionRecord).toBeConnectedWith(faberConnectionRecord)
    expect(aliceConnectionRecord?.theirDid).toContain('did:sov:')
    expect(aliceConnectionRecord?.did).toContain('did:sov:')
  })

  test('can create a multi-use invitation using a did:sov did and process the invitation multiple times, but reuse the connection', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord = await faberAgent.oob.createInvitation({
      multiUseInvitation: true,
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      { reuseConnection: false }
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')
    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)

    let { connectionRecord: aliceConnectionRecord2 } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      { reuseConnection: true }
    )
    if (!aliceConnectionRecord2) throw new Error('Expected aliceConnectionRecord2 to be defined')
    aliceConnectionRecord2 = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord2.id)

    expect(aliceConnectionRecord2.id).toEqual(aliceConnectionRecord.id)
    const [faberConnectionRecord] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)
    // await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord2.id)

    expect(aliceConnectionRecord).toBeConnectedWith(faberConnectionRecord)
    expect(aliceConnectionRecord2).toBeConnectedWith(faberConnectionRecord)
    expect(aliceConnectionRecord.theirDid).toContain('did:sov:')
    expect(aliceConnectionRecord.did).toContain('did:peer:1')
    expect(faberConnectionRecord.did).toContain('did:sov:')
    expect(aliceConnectionRecord?.did).toContain('did:peer:1')
  })

  test('can create a multi-use invitation using a did:sov did but throw an error if receiving an invitation and the same did pair (theirDid, ourDid) is used for a new connection', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did
    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord = await faberAgent.oob.createInvitation({
      multiUseInvitation: true,
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')
    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)

    const { connectionRecord: aliceConnectionRecord2 } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      {
        routing: {
          did: aliceConnectionRecord.did,
        },
      }
    )

    // TODO: add did-exchange problem report handler, so we can handle the case in this test
    // TODO: extend agent message processed event.
    aliceAgent.events.on(AgentEventTypes.AgentMessageProcessed, console.log)

    // if (!aliceConnectionRecord2) throw new Error('Expected aliceConnectionRecord2 to be defined')
    // aliceConnectionRecord2 = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord2.id)

    // expect(aliceConnectionRecord2.id).toEqual(aliceConnectionRecord.id)
    // const [faberConnectionRecord] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord.id)
    // await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)
    // // await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord2.id)

    // expect(aliceConnectionRecord).toBeConnectedWith(faberConnectionRecord)
    // expect(aliceConnectionRecord2).toBeConnectedWith(faberConnectionRecord)
    // expect(aliceConnectionRecord.theirDid).toContain('did:sov:')
    // expect(aliceConnectionRecord.did).toContain('did:peer:1')
    // expect(faberConnectionRecord.did).toContain('did:sov:')
    // expect(aliceConnectionRecord?.did).toContain('did:peer:1')
  })

  test('can create a multi-use invitation using a did:sov did and process the invitation multiple times, not reusing the connection', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord = await faberAgent.oob.createInvitation({
      multiUseInvitation: true,
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      { reuseConnection: false }
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')
    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)

    let { connectionRecord: aliceConnectionRecord2 } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord.outOfBandInvitation,
      { reuseConnection: false }
    )
    if (!aliceConnectionRecord2) throw new Error('Expected aliceConnectionRecord2 to be defined')
    aliceConnectionRecord2 = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord2.id)

    // Should be different
    expect(aliceConnectionRecord2.id).not.toEqual(aliceConnectionRecord.id)

    const [faberConnectionRecord, faberConnectionRecord2] = await faberAgent.connections.findAllByOutOfBandId(
      faberOutOfBandRecord.id
    )
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord2.id)

    expect(aliceConnectionRecord.did?.startsWith('did:peer:1')).toBe(true)
    expect(aliceConnectionRecord2.did?.startsWith('did:peer:1')).toBe(true)
    expect(aliceConnectionRecord.did).not.toEqual(aliceConnectionRecord2.did)

    expect(aliceConnectionRecord.theirDid).toBe(faberDidResult.didState.did)
    expect(aliceConnectionRecord2.theirDid).toBe(faberDidResult.didState.did)

    expect(faberConnectionRecord.theirDid?.startsWith('did:peer:1')).toBe(true)
    expect(faberConnectionRecord2.theirDid?.startsWith('did:peer:1')).toBe(true)

    expect(faberConnectionRecord.theirDid).not.toBe(faberConnectionRecord2.theirDid)
  })

  test('can create multiple single-use invitation using the same did:sov did and process the different invitations, not reusing the connection', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord1 = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    const faberOutOfBandRecord2 = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord2.outOfBandInvitation,
      { reuseConnection: false }
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')
    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)

    let { connectionRecord: aliceConnectionRecord2 } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord2.outOfBandInvitation,
      { reuseConnection: false }
    )
    if (!aliceConnectionRecord2) throw new Error('Expected aliceConnectionRecord2 to be defined')
    aliceConnectionRecord2 = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord2.id)

    // Should be different
    expect(aliceConnectionRecord2.id).not.toEqual(aliceConnectionRecord.id)

    const [faberConnectionRecord] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord1.id)
    const [faberConnectionRecord2] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord2.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord.id)
    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord2.id)

    expect(aliceConnectionRecord.did?.startsWith('did:peer:1')).toBe(true)
    expect(aliceConnectionRecord2.did?.startsWith('did:peer:1')).toBe(true)
    expect(aliceConnectionRecord.did).not.toEqual(aliceConnectionRecord2.did)

    expect(aliceConnectionRecord.theirDid).toBe(faberDidResult.didState.did)
    expect(aliceConnectionRecord2.theirDid).toBe(faberDidResult.didState.did)

    expect(faberConnectionRecord.theirDid?.startsWith('did:peer:1')).toBe(true)
    expect(faberConnectionRecord2.theirDid?.startsWith('did:peer:1')).toBe(true)

    expect(faberConnectionRecord.theirDid).not.toBe(faberConnectionRecord2.theirDid)
  })

  test('can create multiple single-use invitation using the same did:sov did and process the different invitations, but reuse the connection', async () => {
    const faberEndorserDid = faberAgent.dependencyManager.resolve<Wallet>(InjectionSymbols.Wallet).publicDid?.did

    const faberDidResult = await faberAgent.dids.create<SovDidCreateOptions>({
      method: 'sov',
      options: {
        alias: 'faber',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        submitterDid: `did:sov:${faberEndorserDid!}`,
        endpoints: {
          endpoint: faberAgent.config.endpoints[0],
        },
      },
    })

    const faberOutOfBandRecord1 = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    const faberOutOfBandRecord2 = await faberAgent.oob.createInvitation({
      routing: {
        did: faberDidResult.didState.did,
      },
    })

    let { connectionRecord: aliceConnectionRecord } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord1.outOfBandInvitation,
      { reuseConnection: false }
    )

    if (!aliceConnectionRecord) throw new Error('Expected aliceConnectionRecord to be defined')
    aliceConnectionRecord = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord.id)

    let { connectionRecord: aliceConnectionRecord2 } = await aliceAgent.oob.receiveInvitation(
      faberOutOfBandRecord2.outOfBandInvitation,
      { reuseConnection: true }
    )
    if (!aliceConnectionRecord2) throw new Error('Expected aliceConnectionRecord2 to be defined')
    aliceConnectionRecord2 = await aliceAgent.connections.returnWhenIsConnected(aliceConnectionRecord2.id)

    expect(aliceConnectionRecord2.id).toEqual(aliceConnectionRecord.id)
    const [faberConnectionRecord1] = await faberAgent.connections.findAllByOutOfBandId(faberOutOfBandRecord1.id)

    // FIXME: look at making outOfBandId an array in the connection record, so we can still find the connection based
    // on the out of band id. Now we need to hook into the event, otherwise it is lost (...)
    // faberOutOfBandRecord2 = await faberAgent.oob.getById(faberOutOfBandRecord2.id)
    // const faberConnectionRecord2 = await faberAgent.connections.getById(faberOutOfBandRecord2.reuseConnectionId!)
    // expect(faberConnectionRecord1.id).toEqual(faberConnectionRecord2.id)

    await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord1.id)
    // await faberAgent.connections.returnWhenIsConnected(faberConnectionRecord2.id)

    expect(aliceConnectionRecord).toBeConnectedWith(faberConnectionRecord1)
    expect(aliceConnectionRecord2).toBeConnectedWith(faberConnectionRecord1)
    expect(aliceConnectionRecord.theirDid).toContain('did:sov:')
    expect(aliceConnectionRecord.did).toContain('did:peer:1')
    expect(faberConnectionRecord1.did).toContain('did:sov:')
    // expect(faberConnectionRecord2.did).toContain('did:sov:')
    expect(aliceConnectionRecord?.did).toContain('did:peer:1')

    // FIXME: we need to wait for the reuse accepted??? Should already be done
    await new Promise((res) => setTimeout(res, 1000))
  })
})
