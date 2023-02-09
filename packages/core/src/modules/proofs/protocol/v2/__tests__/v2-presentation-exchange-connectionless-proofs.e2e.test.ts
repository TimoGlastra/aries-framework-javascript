import type { SubjectMessage } from '../../../../../../../../tests/transport/SubjectInboundTransport'
import type { Wallet } from '../../../../../wallet'
import type { JsonCredential, CredentialStateChangedEvent } from '../../../../credentials'
import type { ProofStateChangedEvent } from '../../../ProofEvents'
import type { PresentationDefinitionV1 } from '@sphereon/pex-models'

import { Subject, ReplaySubject } from 'rxjs'

import { V1ProofProtocol } from '../..'
import { SubjectInboundTransport } from '../../../../../../../../tests/transport/SubjectInboundTransport'
import { SubjectOutboundTransport } from '../../../../../../../../tests/transport/SubjectOutboundTransport'
import {
  setupJsonLdProofsTest,
  waitForProofExchangeRecordSubject,
  getAgentOptions,
  makeConnection,
  waitForCredentialRecordSubject,
} from '../../../../../../tests/helpers'
import testLogger from '../../../../../../tests/logger'
import { Agent } from '../../../../../agent/Agent'
import { InjectionSymbols } from '../../../../../constants'
import { KeyType } from '../../../../../crypto'
import { uuid } from '../../../../../utils/uuid'
import { HandshakeProtocol } from '../../../../connections'
import {
  IndyCredentialFormatService,
  JsonLdCredentialFormatService,
  CredentialsModule,
  V1CredentialProtocol,
  V2CredentialProtocol,
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialState,
} from '../../../../credentials'
import { DidKey } from '../../../../dids'
import { MediatorPickupStrategy } from '../../../../routing'
import { W3cVcModule } from '../../../../vc'
import { customDocumentLoader } from '../../../../vc/__tests__/documentLoader'
import { ProofEventTypes } from '../../../ProofEvents'
import { ProofsModule } from '../../../ProofsModule'
import { TEST_INPUT_DESCRIPTORS_CITIZENSHIP } from '../../../__tests__/fixtures'
import { IndyProofFormatService, PresentationExchangeProofFormatService } from '../../../formats'
import { AutoAcceptProof, ProofState } from '../../../models'
import { V2ProofProtocol } from '../V2ProofProtocol'

describe('Present Proof', () => {
  let agents: Agent[]

  afterEach(async () => {
    for (const agent of agents) {
      await agent.shutdown()
      await agent.wallet.delete()
    }
  })

  test('Faber starts with connection-less proof requests to Alice', async () => {
    const { aliceAgent, faberAgent, aliceReplay, faberReplay } = await setupJsonLdProofsTest(
      'Faber connection-less Proofs',
      'Alice connection-less Proofs',
      AutoAcceptProof.Never
    )
    agents = [aliceAgent, faberAgent]
    testLogger.test('Faber sends presentation request to Alice')

    const presentationDefinition: PresentationDefinitionV1 = {
      input_descriptors: [TEST_INPUT_DESCRIPTORS_CITIZENSHIP],
      id: 'e950bfe5-d7ec-4303-ad61-6983fb976ac9',
    }

    let aliceProofExchangeRecordPromise = waitForProofExchangeRecordSubject(aliceReplay, {
      state: ProofState.RequestReceived,
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
    })

    const { message: requestMessage } = await faberAgent.oob.createLegacyConnectionlessInvitation({
      recordId: faberProofExchangeRecord.id,
      message,
      domain: 'https://a-domain.com',
    })
    await aliceAgent.receiveMessage(requestMessage.toJSON())

    testLogger.test('Alice waits for presentation request from Faber')
    let aliceProofExchangeRecord = await aliceProofExchangeRecordPromise

    testLogger.test('Alice accepts presentation request from Faber')

    const requestedCredentials = await aliceAgent.proofs.selectCredentialsForRequest({
      proofRecordId: aliceProofExchangeRecord.id,
    })

    const acceptPresentationOptions = {
      proofRecordId: aliceProofExchangeRecord.id,
      proofFormats: { presentationExchange: requestedCredentials.proofFormats.presentationExchange },
    }

    const faberProofExchangeRecordPromise = waitForProofExchangeRecordSubject(faberReplay, {
      threadId: aliceProofExchangeRecord.threadId,
      state: ProofState.PresentationReceived,
    })

    await aliceAgent.proofs.acceptRequest(acceptPresentationOptions)
    testLogger.test('Faber waits for presentation from Alice')
    faberProofExchangeRecord = await faberProofExchangeRecordPromise

    // assert presentation is valid
    expect(faberProofExchangeRecord.isVerified).toBe(true)

    aliceProofExchangeRecordPromise = waitForProofExchangeRecordSubject(aliceReplay, {
      threadId: aliceProofExchangeRecord.threadId,
      state: ProofState.Done,
    })

    // Faber accepts presentation
    await faberAgent.proofs.acceptPresentation({ proofRecordId: faberProofExchangeRecord.id })

    // Alice waits till it receives presentation ack
    aliceProofExchangeRecord = await aliceProofExchangeRecordPromise
  })

  test('Faber starts with connection-less proof requests to Alice with auto-accept enabled', async () => {
    testLogger.test('Faber sends presentation request to Alice')

    const { aliceAgent, faberAgent, aliceReplay, faberReplay } = await setupJsonLdProofsTest(
      'Faber connection-less Proofs - Auto Accept',
      'Alice connection-less Proofs - Auto Accept',
      AutoAcceptProof.Always
    )

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

  xtest('Faber starts with connection-less proof requests to Alice with auto-accept enabled and both agents having a mediator', async () => {
    testLogger.test('Faber sends presentation request to Alice')

    const indyCredentialFormat = new IndyCredentialFormatService()
    const jsonLdCredentialFormat = new JsonLdCredentialFormatService()
    const indyProofFormat = new IndyProofFormatService()
    const presentationExchangeProofFormatService = new PresentationExchangeProofFormatService()

    const unique = uuid().substring(0, 4)

    const modules = {
      // Initialize custom credentials module (with jsonLdCredentialFormat enabled)
      credentials: new CredentialsModule({
        credentialProtocols: [
          new V1CredentialProtocol({ indyCredentialFormat }),
          new V2CredentialProtocol({
            credentialFormats: [indyCredentialFormat, jsonLdCredentialFormat],
          }),
        ],
      }),
      // Initialize custom proofs module (with presentationExchangeFormat enabled)
      proofs: new ProofsModule({
        proofProtocols: [
          new V1ProofProtocol({ indyProofFormat }),
          new V2ProofProtocol({
            proofFormats: [indyProofFormat, presentationExchangeProofFormatService],
          }),
        ],
      }),
      // Register custom w3cVc module so we can define the test document loader
      w3cVc: new W3cVcModule({
        documentLoader: customDocumentLoader,
      }),
    }
    const mediatorOptions = getAgentOptions(
      `Connectionless proofs with mediator Mediator-${unique}`,
      {
        endpoints: ['rxjs:faber'],
      },
      modules
    )

    const faberMessages = new Subject<SubjectMessage>()
    const aliceMessages = new Subject<SubjectMessage>()
    const mediatorMessages = new Subject<SubjectMessage>()

    const subjectMap = {
      'rxjs:faber': faberMessages,
      'rxjs:alice': aliceMessages,
      'rxjs:mediator': mediatorMessages,
    }

    // Initialize mediator
    const mediatorAgent = new Agent(mediatorOptions)
    mediatorAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    mediatorAgent.registerInboundTransport(new SubjectInboundTransport(mediatorMessages))
    await mediatorAgent.initialize()

    const faberMediationOutOfBandRecord = await mediatorAgent.oob.createInvitation({
      label: 'faber invitation',
      handshakeProtocols: [HandshakeProtocol.Connections],
    })

    const aliceMediationOutOfBandRecord = await mediatorAgent.oob.createInvitation({
      label: 'alice invitation',
      handshakeProtocols: [HandshakeProtocol.Connections],
    })

    const faberOptions = getAgentOptions(
      `Connectionless proofs with mediator Faber-${unique}`,
      {
        autoAcceptProofs: AutoAcceptProof.Always,
        autoAcceptCredentials: AutoAcceptCredential.Always,
        mediatorConnectionsInvite: faberMediationOutOfBandRecord.outOfBandInvitation.toUrl({
          domain: 'https://example.com',
        }),
        mediatorPickupStrategy: MediatorPickupStrategy.PickUpV1,
      },
      modules
    )

    const aliceOptions = getAgentOptions(`Connectionless proofs with mediator Alice-${unique}`, {
      autoAcceptProofs: AutoAcceptProof.Always,
      autoAcceptCredentials: AutoAcceptCredential.Always,
      mediatorConnectionsInvite: aliceMediationOutOfBandRecord.outOfBandInvitation.toUrl({
        domain: 'https://example.com',
      }),
      mediatorPickupStrategy: MediatorPickupStrategy.PickUpV1,
    })

    const faberAgent = new Agent(faberOptions)
    faberAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    faberAgent.registerInboundTransport(new SubjectInboundTransport(faberMessages))
    await faberAgent.initialize()

    const aliceAgent = new Agent(aliceOptions)
    aliceAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    aliceAgent.registerInboundTransport(new SubjectInboundTransport(aliceMessages))
    await aliceAgent.initialize()

    agents = [aliceAgent, faberAgent, mediatorAgent]

    // const { definition } = await prepareForIssuance(faberAgent, ['name', 'age', 'image_0', 'image_1'])

    const [faberConnection, aliceConnection] = await makeConnection(faberAgent, aliceAgent)
    expect(faberConnection.isReady).toBe(true)
    expect(aliceConnection.isReady).toBe(true)

    const issuerSeed = 'testseed0000000000000000000000I1'
    const holderSeed = 'testseed0000000000000000000000H1'

    const faberWallet = faberAgent.injectionContainer.resolve<Wallet>(InjectionSymbols.Wallet)
    const faberKey = await faberWallet.createKey({ keyType: KeyType.Ed25519, seed: issuerSeed })
    const faberDidKey = new DidKey(faberKey)

    const aliceWallet = aliceAgent.injectionContainer.resolve<Wallet>(InjectionSymbols.Wallet)
    const aliceKey = await aliceWallet.createKey({ keyType: KeyType.Ed25519, seed: holderSeed })
    const aliceDidKey = new DidKey(aliceKey)

    const inputDoc: JsonCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/citizenship/v1',
        'https://w3id.org/security/bbs/v1',
      ],
      id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      issuer: faberDidKey.did,
      identifier: '83627465',
      name: 'Permanent Resident Card',
      description: 'Government of Example Permanent Resident Card.',
      issuanceDate: '2019-12-03T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      credentialSubject: {
        id: aliceDidKey.did,
        type: ['PermanentResident', 'Person'],
        givenName: 'JOHN',
        familyName: 'SMITH',
        gender: 'Male',
        image: 'data:image/png;base64,iVBORw0KGgokJggg==',
        residentSince: '2015-01-01',
        lprCategory: 'C09',
        lprNumber: '999-999-999',
        commuterClassification: 'C1',
        birthCountry: 'Bahamas',
        birthDate: '1958-07-17',
      },
    }

    const signCredentialOptions = {
      credential: inputDoc,
      options: {
        proofPurpose: 'assertionMethod',
        proofType: 'Ed25519Signature2018',
      },
    }

    const issuerReplay = new ReplaySubject<CredentialStateChangedEvent>()
    const holderReplay = new ReplaySubject<CredentialStateChangedEvent>()

    faberAgent.events
      .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
      .subscribe(issuerReplay)
    aliceAgent.events
      .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
      .subscribe(holderReplay)

    let issuerCredentialRecord = await faberAgent.credentials.offerCredential({
      comment: 'some comment about credential',
      connectionId: faberConnection.id,
      credentialFormats: {
        jsonld: signCredentialOptions,
      },
      protocolVersion: 'v2',
    })

    // Because we use auto-accept it can take a while to have the whole credential flow finished
    // Both parties need to interact with the ledger and sign/verify the credential
    await waitForCredentialRecordSubject(holderReplay, {
      threadId: issuerCredentialRecord.threadId,
      state: CredentialState.Done,
    })
    issuerCredentialRecord = await waitForCredentialRecordSubject(issuerReplay, {
      threadId: issuerCredentialRecord.threadId,
      state: CredentialState.Done,
    })

    const faberReplay = new ReplaySubject<ProofStateChangedEvent>()
    const aliceReplay = new ReplaySubject<ProofStateChangedEvent>()

    faberAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(faberReplay)
    aliceAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(aliceReplay)

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
    const mediationRecord = await faberAgent.mediationRecipient.findDefaultMediator()
    if (!mediationRecord) {
      throw new Error('Faber agent has no default mediator')
    }

    expect(message).toMatchObject({
      service: {
        recipientKeys: [expect.any(String)],
        routingKeys: mediationRecord.routingKeys,
        serviceEndpoint: mediationRecord.endpoint,
      },
    })

    await aliceProofExchangeRecordPromise

    await faberProofExchangeRecordPromise
  })
})
