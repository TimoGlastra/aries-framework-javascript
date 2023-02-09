import type { JsonLdProofsTestsAgent } from '../../../../../../tests/helpers'
import type { ConnectionRecord } from '../../../../connections/repository/ConnectionRecord'

import { setupJsonLdProofsTest, waitForProofExchangeRecord } from '../../../../../../tests/helpers'
import testLogger from '../../../../../../tests/logger'
import { TEST_INPUT_DESCRIPTORS_CITIZENSHIP } from '../../../__tests__/fixtures'
import { ProofState } from '../../../models/ProofState'

describe('Present Proof | V2 | DIF Presentation Exchange', () => {
  let faberAgent: JsonLdProofsTestsAgent
  let aliceAgent: JsonLdProofsTestsAgent
  let aliceConnection: ConnectionRecord

  beforeAll(async () => {
    testLogger.test('Initializing the agents')
    ;({ faberAgent, aliceAgent, aliceConnection } = await setupJsonLdProofsTest('Faber agent', 'Alice agent'))
  })

  afterAll(async () => {
    testLogger.test('Shutting down both agents')
    await faberAgent.shutdown()
    await faberAgent.wallet.delete()
    await aliceAgent.shutdown()
    await aliceAgent.wallet.delete()
  })

  test(`Alice Creates and sends Proof Proposal to Faber`, async () => {
    testLogger.test('Alice sends proof proposal to Faber')

    const faberPresentationRecordPromise = waitForProofExchangeRecord(faberAgent, {
      state: ProofState.ProposalReceived,
    })

    await aliceAgent.proofs.proposeProof({
      connectionId: aliceConnection.id,
      protocolVersion: 'v2',
      proofFormats: {
        presentationExchange: {
          inputDescriptors: [TEST_INPUT_DESCRIPTORS_CITIZENSHIP],
        },
      },
      comment: 'V2 Presentation Exchange propose proof test',
    })

    testLogger.test('Faber waits for presentation from Alice')
    const faberProofExchangeRecord = await faberPresentationRecordPromise

    const proposal = await faberAgent.proofs.findProposalMessage(faberProofExchangeRecord.id)

    expect(proposal).toMatchObject({
      type: 'https://didcomm.org/present-proof/2.0/propose-presentation',
      formats: [
        {
          attachmentId: expect.any(String),
          format: 'dif/presentation-exchange/definitions@v1.0',
        },
      ],
      proposalAttachments: [
        {
          id: expect.any(String),
          mimeType: 'application/json',
          data: {
            json: {
              input_descriptors: [TEST_INPUT_DESCRIPTORS_CITIZENSHIP],
            },
          },
        },
      ],
      id: expect.any(String),
      comment: 'V2 Presentation Exchange propose proof test',
    })
    expect(faberProofExchangeRecord.id).not.toBeNull()
    expect(faberProofExchangeRecord).toMatchObject({
      threadId: faberProofExchangeRecord.threadId,
      state: ProofState.ProposalReceived,
      protocolVersion: 'v2',
    })
  })
})
