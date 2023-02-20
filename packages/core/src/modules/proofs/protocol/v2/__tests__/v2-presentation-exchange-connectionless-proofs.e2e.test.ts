import type { Agent } from '../../../../../agent/Agent'
import type { PresentationDefinitionV1 } from '@sphereon/pex-models'

import { setupJsonLdTests } from '../../../../../../tests'
import { waitForProofExchangeRecordSubject } from '../../../../../../tests/helpers'
import testLogger from '../../../../../../tests/logger'
import { TEST_INPUT_DESCRIPTORS_CITIZENSHIP } from '../../../__tests__/fixtures'
import { AutoAcceptProof, ProofState } from '../../../models'

describe('Present Proof', () => {
  let agents: Agent[]

  afterEach(async () => {
    for (const agent of agents) {
      await agent.shutdown()
      await agent.wallet.delete()
    }
  })

  test('Faber starts with connection-less proof requests to Alice', async () => {
    const {
      holderAgent: aliceAgent,
      issuerAgent: faberAgent,
      holderReplay: aliceReplay,
      issuerReplay: faberReplay,
    } = await setupJsonLdTests({
      issuerName: 'Faber connection-less Proofs',
      holderName: 'Alice connection-less Proofs',
      autoAcceptProofs: AutoAcceptProof.Never,
      createConnections: false,
    })
    agents = [aliceAgent, faberAgent]
    testLogger.test('Faber sends presentation request to Alice')

    // eslint-disable-next-line prefer-const
    let { message, proofRecord: faberProofExchangeRecord } = await faberAgent.proofs.createRequest({
      protocolVersion: 'v2',
      proofFormats: {
        presentationExchange: {
          options: {
            challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
            domain: '',
          },
          presentationDefinition: {
            input_descriptors: [TEST_INPUT_DESCRIPTORS_CITIZENSHIP],
            id: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
          },
        },
      },
    })

    const { message: requestMessage } = await faberAgent.oob.createLegacyConnectionlessInvitation({
      recordId: faberProofExchangeRecord.id,
      message,
      domain: 'https://a-domain.com',
    })
    await aliceAgent.receiveMessage(requestMessage.toJSON())

    testLogger.test('Alice waits for presentation request from Faber')
    let aliceProofExchangeRecord = await waitForProofExchangeRecordSubject(aliceReplay, {
      state: ProofState.RequestReceived,
      threadId: faberProofExchangeRecord.threadId,
    })

    testLogger.test('Alice accepts presentation request from Faber')

    const requestedCredentials = await aliceAgent.proofs.selectCredentialsForRequest({
      proofRecordId: aliceProofExchangeRecord.id,
    })

    await aliceAgent.proofs.acceptRequest({
      proofRecordId: aliceProofExchangeRecord.id,
      proofFormats: { presentationExchange: requestedCredentials.proofFormats.presentationExchange },
    })
    testLogger.test('Faber waits for presentation from Alice')
    faberProofExchangeRecord = await waitForProofExchangeRecordSubject(faberReplay, {
      threadId: aliceProofExchangeRecord.threadId,
      state: ProofState.PresentationReceived,
    })

    // assert presentation is valid
    expect(faberProofExchangeRecord.isVerified).toBe(true)

    // Faber accepts presentation
    await faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id })

    // Alice waits till it receives presentation ack
    aliceProofExchangeRecord = await waitForProofExchangeRecordSubject(aliceReplay, {
      threadId: aliceProofExchangeRecord.threadId,
      state: ProofState.Done,
    })
  })

  test('Faber starts with connection-less proof requests to Alice with auto-accept enabled', async () => {
    testLogger.test('Faber sends presentation request to Alice')

    const {
      holderAgent: aliceAgent,
      issuerAgent: faberAgent,
      holderReplay: aliceReplay,
      issuerReplay: faberReplay,
    } = await setupJsonLdTests({
      issuerName: 'Faber connection-less Proofs - Auto Accept',
      holderName: 'Alice connection-less Proofs - Auto Accept',
      autoAcceptProofs: AutoAcceptProof.Always,
    })

    agents = [aliceAgent, faberAgent]

    const presentationDefinition: PresentationDefinitionV1 = {
      input_descriptors: [TEST_INPUT_DESCRIPTORS_CITIZENSHIP],
      id: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
    }

    const aliceProofExchangeRecordPromise = waitForProofExchangeRecordSubject(aliceReplay, {
      state: ProofState.Done,
    })

    const faberProofExchangeRecordPromise = waitForProofExchangeRecordSubject(faberReplay, {
      state: ProofState.Done,
    })

    // eslint-disable-next-line prefer-const
    let { message, proofRecord: faberProofExchangeRecord } = await faberAgent.proofs.createRequest({
      protocolVersion: 'v2',
      proofFormats: {
        presentationExchange: {
          options: {
            challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
            domain: '',
          },
          presentationDefinition,
        },
      },
      autoAcceptProof: AutoAcceptProof.ContentApproved,
    })

    const { message: requestMessage } = await faberAgent.oob.createLegacyConnectionlessInvitation({
      recordId: faberProofExchangeRecord.id,
      message,
      domain: 'https://a-domain.com',
    })
    await aliceAgent.receiveMessage(requestMessage.toJSON())

    await aliceProofExchangeRecordPromise

    await faberProofExchangeRecordPromise
  })
})
