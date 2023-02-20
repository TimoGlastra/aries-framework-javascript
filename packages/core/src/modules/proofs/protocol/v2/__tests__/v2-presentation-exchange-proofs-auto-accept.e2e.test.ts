import type { JsonLdProofsTestsAgent } from '../../../../../../tests/helpers'
import type { ConnectionRecord } from '../../../../connections'
import type { PresentationDefinitionV1 } from '@sphereon/pex-models'
import type { IVerifiablePresentation } from '@sphereon/ssi-types'

import {
  setupJsonLdProofsTest,
  waitForProofExchangeRecord,
  setupJsonLdProofsTestMultipleCredentials,
} from '../../../../../../tests/helpers'
import testLogger from '../../../../../../tests/logger'
import { DidCommMessageRepository } from '../../../../../storage'
import { AutoAcceptProof, ProofState } from '../../../models'
import { V2PresentationMessage } from '../messages'

const inputDescriptors = [
  {
    id: 'vaccine_input_1',
    name: 'Vaccine Information',
    purpose: 'We need your Vaccine information.',
    group: ['A'],
    schema: [
      {
        uri: 'https://w3id.org/vaccination/v1',
      },
    ],
  },
  {
    id: 'citizenship_input_1',
    name: 'Residency Information',
    purpose: 'We need your Residency information.',
    group: ['B'],
    schema: [
      {
        uri: 'https://w3id.org/citizenship/v1',
      },
    ],
  },
  {
    id: 'citizenship_input_2',
    name: 'Residency Information',
    purpose: 'We need your Residency information.',
    group: ['B'],
    schema: [
      {
        uri: 'https://w3id.org/citizenship/v2',
      },
    ],
  },
  {
    id: 'vaccine_input_2',
    name: 'Vaccine Information',
    purpose: 'We need your Vaccine information.',
    group: ['C'],
    schema: [
      {
        uri: 'https://w3id.org/vaccination/v2',
      },
    ],
  },
] satisfies PresentationDefinitionV1['input_descriptors']

const inputDescriptorCitizenship = {
  constraints: {
    fields: [
      {
        path: ['$.credentialSubject.familyName'],
        purpose: 'The claim must be from one of the specified issuers',
        id: '1f44d55f-f161-4938-a659-f8026467f126',
      },
      {
        path: ['$.credentialSubject.givenName'],
        purpose: 'The claim must be from one of the specified issuers',
      },
    ],
  },
  schema: [
    {
      uri: 'https://www.w3.org/2018/credentials/v1',
    },
    {
      uri: 'https://www.w3.org/2018/credentials#VerifiableCredential',
    },
    {
      uri: 'https://w3id.org/citizenship#PermanentResident',
    },
    {
      uri: 'https://w3id.org/citizenship/v1',
    },
    {
      uri: 'https://w3id.org/security/bbs/v1',
    },
  ],
  name: "EU Driver's License 1",
  group: ['A'],
  id: 'citizenship_input_1',
}

describe('Auto accept present proof', () => {
  let faberAgent: JsonLdProofsTestsAgent
  let aliceAgent: JsonLdProofsTestsAgent
  let faberConnection: ConnectionRecord
  let aliceConnection: ConnectionRecord

  // Input_descriptors define the fields to be requested in a presentation definition for a given credential
  // submission_requirements specify combinations of input descriptors to allow multiple credentials
  // to be retrieved

  // query is based on matching the schema uri in the credential with that of the input descriptor g

  describe("Auto accept on 'always'", () => {
    afterAll(async () => {
      if (faberAgent) {
        await faberAgent.shutdown()
        await faberAgent.wallet.delete()
      }
      if (aliceAgent) {
        await aliceAgent.shutdown()
        await aliceAgent.wallet.delete()
      }
    })

    test("Alice starts with proof proposal to Faber, both with autoAcceptProof on 'always'", async () => {
      const { faberAgent, aliceAgent, aliceConnection } = await setupJsonLdProofsTest(
        'Faber Auto Accept Always Proofs',
        'Alice Auto Accept Always Proofs',
        AutoAcceptProof.Always
      )
      testLogger.test('Alice sends presentation proposal to Faber')

      const aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      await aliceAgent.proofs.proposeProof({
        connectionId: aliceConnection.id,
        protocolVersion: 'v2',
        proofFormats: {
          presentationExchange: {
            inputDescriptors: [inputDescriptorCitizenship],
          },
        },
        comment: 'V2 Presentation Exchange propose proof test',
      })

      testLogger.test('Faber waits for presentation from Alice')
      await faberProofExchangeRecordPromise

      testLogger.test('Alice waits till it receives presentation ack')
      await aliceProofExchangeRecordPromise
    })

    test("Faber starts with proof requests to Alice, both with autoAcceptProof on 'always'", async () => {
      const { faberAgent, aliceAgent, faberConnection } = await setupJsonLdProofsTest(
        'Faber Auto Accept Always Proofs',
        'Alice Auto Accept Always Proofs',
        AutoAcceptProof.Always
      )
      testLogger.test('Faber sends presentation request to Alice')

      const faberProofExchangeRecord = await faberAgent.proofs.requestProof({
        protocolVersion: 'v2',
        connectionId: faberConnection.id,
        proofFormats: {
          presentationExchange: {
            options: {
              challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
              domain: '',
            },
            presentationDefinition: {
              id: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
              input_descriptors: [inputDescriptorCitizenship],
            },
          },
        },
      })
      testLogger.test('Faber waits for presentation from Alice')
      await waitForProofExchangeRecord(faberAgent, {
        threadId: faberProofExchangeRecord.threadId,
        state: ProofState.Done,
      })
      // Alice waits till it receives presentation ack
      await waitForProofExchangeRecord(aliceAgent, {
        threadId: faberProofExchangeRecord.threadId,
        state: ProofState.Done,
      })
    })

    test('Submission Requirements', async () => {
      const { faberAgent, aliceAgent, aliceConnection } = await setupJsonLdProofsTestMultipleCredentials(
        'Faber Auto Accept Always Proofs',
        'Alice Auto Accept Always Proofs',
        AutoAcceptProof.Always
      )
      const didCommMessageRepository =
        faberAgent.injectionContainer.resolve<DidCommMessageRepository>(DidCommMessageRepository)

      testLogger.test('Alice sends presentation proposal to Faber')

      const aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      await aliceAgent.proofs.proposeProof({
        connectionId: aliceConnection.id,
        protocolVersion: 'v2',
        proofFormats: {
          presentationExchange: {
            inputDescriptors,
          },
        },
        comment: 'V2 Presentation Exchange propose proof test',
      })

      testLogger.test('Faber waits for presentation from Alice')
      const faberProofExchangeRecord = await faberProofExchangeRecordPromise

      testLogger.test('Alice waits till it receives presentation ack')
      await aliceProofExchangeRecordPromise

      const presentation = await didCommMessageRepository.findAgentMessage(faberAgent.context, {
        associatedRecordId: faberProofExchangeRecord.id,
        messageClass: V2PresentationMessage,
      })

      const data: IVerifiablePresentation | undefined =
        presentation?.presentationAttachments[0].getDataAsJson<IVerifiablePresentation>()

      // expect 3 VCs: one from group A, one from group B, one from group C
      expect(data?.verifiableCredential.length).toBe(3)

      // vaccine credential 0 (Group A)
      expect(data?.verifiableCredential[0].id).toBe('urn:uvci:af5vshde843jf831j128fj')

      // citizenship credential 1 (Group B)
      expect(data?.verifiableCredential[1].id).toBe('https://issuer.oidp.uscis.gov/credentials/83627465dsdsdsd')

      // vaccine credential 2 (Group C)
      expect(data?.verifiableCredential[2].id).toBe('urn:uvci:af5vshde843jf831j12VAX')
    })

    test('Submission Requirements with nested rules (use pick/count so nested is an OR query)', async () => {
      const { faberAgent, aliceAgent, aliceConnection } = await setupJsonLdProofsTestMultipleCredentials(
        'Faber Auto Accept Always Proofs',
        'Alice Auto Accept Always Proofs',
        AutoAcceptProof.Always
      )
      const didCommMessageRepository =
        faberAgent.injectionContainer.resolve<DidCommMessageRepository>(DidCommMessageRepository)

      testLogger.test('Alice sends presentation proposal to Faber')

      const aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      await aliceAgent.proofs.proposeProof({
        connectionId: aliceConnection.id,
        protocolVersion: 'v2',
        proofFormats: {
          presentationExchange: {
            inputDescriptors,
          },
        },
        comment: 'V2 Presentation Exchange propose proof test',
      })

      testLogger.test('Faber waits for presentation from Alice')
      const faberProofExchangeRecord = await faberProofExchangeRecordPromise

      testLogger.test('Alice waits till it receives presentation ack')
      await aliceProofExchangeRecordPromise

      const presentation = await didCommMessageRepository.findAgentMessage(faberAgent.context, {
        associatedRecordId: faberProofExchangeRecord.id,
        messageClass: V2PresentationMessage,
      })

      const data: IVerifiablePresentation | undefined =
        presentation?.presentationAttachments[0].getDataAsJson<IVerifiablePresentation>()

      // expect 2 VCs: one from group A, one from either group B or group C (in this case B)
      expect(data?.verifiableCredential.length).toBe(2)

      // vaccine credential 0 (Group A)
      expect(data?.verifiableCredential[0].id).toBe('urn:uvci:af5vshde843jf831j128fj')

      // citizenship credential 1 (Group B)
      expect(data?.verifiableCredential[1].id).toBe('https://issuer.oidp.uscis.gov/credentials/83627465dsdsdsd')
    })

    test('Submission Requirements with nested rules (use "all" so nested is an AND query)', async () => {
      const { faberAgent, aliceAgent, aliceConnection } = await setupJsonLdProofsTestMultipleCredentials(
        'Faber Auto Accept Always Proofs',
        'Alice Auto Accept Always Proofs',
        AutoAcceptProof.Always
      )
      const didCommMessageRepository =
        faberAgent.injectionContainer.resolve<DidCommMessageRepository>(DidCommMessageRepository)

      testLogger.test('Alice sends presentation proposal to Faber')

      const aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      await aliceAgent.proofs.proposeProof({
        connectionId: aliceConnection.id,
        protocolVersion: 'v2',
        proofFormats: {
          presentationExchange: {
            inputDescriptors,
          },
        },
        comment: 'V2 Presentation Exchange propose proof test',
      })

      testLogger.test('Faber waits for presentation from Alice')
      const faberProofExchangeRecord = await faberProofExchangeRecordPromise

      testLogger.test('Alice waits till it receives presentation ack')
      await aliceProofExchangeRecordPromise

      const presentation = await didCommMessageRepository.findAgentMessage(faberAgent.context, {
        associatedRecordId: faberProofExchangeRecord.id,
        messageClass: V2PresentationMessage,
      })

      const data: IVerifiablePresentation | undefined =
        presentation?.presentationAttachments[0].getDataAsJson<IVerifiablePresentation>()

      // expect 2 VCs: one from group A, one from either group B or group C (in this case B)
      expect(data?.verifiableCredential.length).toBe(3)

      // vaccine credential 0 (Group A)
      expect(data?.verifiableCredential[0].id).toBe('urn:uvci:af5vshde843jf831j128fj')

      // citizenship credential 1 (Group B)
      expect(data?.verifiableCredential[1].id).toBe('https://issuer.oidp.uscis.gov/credentials/83627465dsdsdsd')

      // citizenship credential 1 (Group C)
      expect(data?.verifiableCredential[2].id).toBe('urn:uvci:af5vshde843jf831j12VAX')
    })
  })

  describe("Auto accept on 'contentApproved'", () => {
    beforeAll(async () => {
      testLogger.test('Initializing the agents')
      ;({ faberAgent, aliceAgent, faberConnection, aliceConnection } = await setupJsonLdProofsTest(
        'Faber Auto Accept Content Approved Proofs',
        'Alice Auto Accept Content Approved Proofs',
        AutoAcceptProof.ContentApproved
      ))
    })
    afterAll(async () => {
      testLogger.test('Shutting down both agents')
      await faberAgent.shutdown()
      await faberAgent.wallet.delete()
      await aliceAgent.shutdown()
      await aliceAgent.wallet.delete()
    })

    test("Alice starts with proof proposal to Faber, both with autoAcceptProof on 'contentApproved'", async () => {
      testLogger.test('Alice sends presentation proposal to Faber')

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      const aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      await aliceAgent.proofs.proposeProof({
        connectionId: aliceConnection.id,
        protocolVersion: 'v2',
        proofFormats: {
          presentationExchange: {
            inputDescriptors: [inputDescriptorCitizenship],
          },
        },
        comment: 'V2 Presentation Exchange propose proof test',
      })

      await faberProofExchangeRecordPromise
      // Alice waits till it receives presentation ack
      await aliceProofExchangeRecordPromise
    })

    test("Faber starts with proof requests to Alice, both with autoAcceptProof on 'contentApproved'", async () => {
      testLogger.test('Faber sends presentation request to Alice')

      let aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.RequestReceived,
      })

      await faberAgent.proofs.requestProof({
        protocolVersion: 'v2',
        connectionId: faberConnection.id,
        proofFormats: {
          presentationExchange: {
            options: {
              challenge: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
            },
            presentationDefinition: {
              id: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
              input_descriptors: [inputDescriptorCitizenship],
            },
          },
        },
      })

      const aliceProofExchangeRecord = await aliceProofExchangeRecordPromise
      await aliceAgent.proofs.acceptRequest({
        proofRecordId: aliceProofExchangeRecord.id,
      })

      const faberProofExchangeRecordPromise = waitForProofExchangeRecord(faberAgent, {
        state: ProofState.Done,
      })

      aliceProofExchangeRecordPromise = waitForProofExchangeRecord(aliceAgent, {
        state: ProofState.Done,
      })

      testLogger.test('Faber waits for presentation from Alice')
      await faberProofExchangeRecordPromise

      // Alice waits till it receives presentation ack
      await aliceProofExchangeRecordPromise
    })
  })
})
