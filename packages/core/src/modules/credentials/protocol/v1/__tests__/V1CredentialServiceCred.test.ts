import type { IndyCredentialViewMetadata, CredentialPreviewAttribute } from '../../..'
import type { AgentConfig } from '../../../../../agent/AgentConfig'
import type { Logger } from '../../../../../logger'
import type { ConnectionRecord } from '../../../../connections'
import { ConnectionService } from '../../../../connections/services/ConnectionService'
import type { DidRepository } from '../../../../dids/repository'
import type { StoreCredentialOptions } from '../../../../indy/services/IndyHolderService'
import type { RevocationNotificationReceivedEvent, CredentialStateChangedEvent } from '../../../CredentialEvents'
import type { CustomCredentialTags } from '../../../repository/CredentialExchangeRecord'

import { IndyCredentialUtils, CredentialState } from '../../..'
import { getAgentConfig, getMockConnection, mockFunction } from '../../../../../../tests/helpers'
import { Dispatcher } from '../../../../../agent/Dispatcher'
import { EventEmitter } from '../../../../../agent/EventEmitter'
import { MessageSender } from '../../../../../agent/MessageSender'
import { InboundMessageContext } from '../../../../../agent/models/InboundMessageContext'
import { Attachment, AttachmentData } from '../../../../../decorators/attachment/Attachment'
import { AriesFrameworkError } from '../../../../../error'
import {
  DidCommMessageRepository,
  GetAgentMessageOptions,
} from '../../../../../storage/didcomm/DidCommMessageRepository'
import { JsonEncoder } from '../../../../../utils/JsonEncoder'
import { AckStatus } from '../../../../common'
import { DidExchangeState } from '../../../../connections'
import { DidResolverService } from '../../../../dids/services/DidResolverService'
import { IndyHolderService } from '../../../../indy/services/IndyHolderService'
import { IndyIssuerService } from '../../../../indy/services/IndyIssuerService'
import { IndyLedgerService } from '../../../../ledger/services/IndyLedgerService'
import { MediationRecipientService } from '../../../../routing/services/MediationRecipientService'
import { CredentialEventTypes } from '../../../CredentialEvents'
import { credDef, credReq, credOffer, schema } from '../../../__tests__/fixtures'
import { CredentialProblemReportReason } from '../../../errors/CredentialProblemReportReason'
import { IndyCredentialFormatService } from '../../../formats/indy/IndyCredentialFormatService'
import { CredentialExchangeRecord } from '../../../repository/CredentialExchangeRecord'
import { CredentialMetadataKeys } from '../../../repository/CredentialMetadataTypes'
import { CredentialRepository } from '../../../repository/CredentialRepository'
import { V1CredentialService } from '../V1CredentialService'
import {
  V1RequestCredentialMessage,
  V1CredentialAckMessage,
  INDY_CREDENTIAL_ATTACHMENT_ID,
  INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
  INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
  V1OfferCredentialMessage,
  V1IssueCredentialMessage,
  V1CredentialProblemReportMessage,
  V1CredentialPreview,
} from '../messages'
import { uuid } from '../../../../../utils/uuid'
import { AutoAcceptCredential, CredentialFormatSpec } from '../../../models'
import { DidCommMessageRole } from '../../../../../storage'
import { JsonTransformer } from '../../../../../utils'

// Mock classes
jest.mock('../../../repository/CredentialRepository')
jest.mock('../../../../ledger/services/IndyLedgerService')
jest.mock('../../../../indy/services/IndyHolderService')
jest.mock('../../../../indy/services/IndyIssuerService')
jest.mock('../../../formats/indy/IndyCredentialFormatService')
jest.mock('../../../../../storage/didcomm/DidCommMessageRepository')
jest.mock('../../../../routing/services/MediationRecipientService')
jest.mock('../../../../dids/services/DidResolverService')
jest.mock('../../../../connections/services/ConnectionService')
jest.mock('../../../../../agent/Dispatcher')

// Mock typed object
const CredentialRepositoryMock = CredentialRepository as jest.Mock<CredentialRepository>
const IndyLedgerServiceMock = IndyLedgerService as jest.Mock<IndyLedgerService>
const IndyHolderServiceMock = IndyHolderService as jest.Mock<IndyHolderService>
const IndyIssuerServiceMock = IndyIssuerService as jest.Mock<IndyIssuerService>
const DidCommMessageRepositoryMock = DidCommMessageRepository as jest.Mock<DidCommMessageRepository>
const MessageSenderMock = MessageSender as jest.Mock<MessageSender>
const MediationRecipientServiceMock = MediationRecipientService as jest.Mock<MediationRecipientService>
const IndyCredentialFormatServiceMock = IndyCredentialFormatService as jest.Mock<IndyCredentialFormatService>
const DidResolverServiceMock = DidResolverService as jest.Mock<DidResolverService>
const ConnectionServiceMock = ConnectionService as jest.Mock<ConnectionService>
const DispatcherMock = Dispatcher as jest.Mock<Dispatcher>

const credentialRepository = new CredentialRepositoryMock()
const indyIssuerService = new IndyIssuerServiceMock()
const didCommMessageRepository = new DidCommMessageRepositoryMock()
const messageSender = new MessageSenderMock()
const mediationRecipientService = new MediationRecipientServiceMock()
const indyHolderService = new IndyHolderServiceMock()
const indyLedgerService = new IndyLedgerServiceMock()
const indyCredentialFormatService = new IndyCredentialFormatServiceMock()
const dispatcher = new DispatcherMock()
const didResolverService = new DidResolverServiceMock()
const connectionService = new ConnectionServiceMock()

const connection = getMockConnection({
  id: '123',
  state: DidExchangeState.Completed,
})

const credentialPreview = V1CredentialPreview.fromRecord({
  name: 'John',
  age: '99',
})

const offerAttachment = new Attachment({
  id: INDY_CREDENTIAL_OFFER_ATTACHMENT_ID,
  mimeType: 'application/json',
  data: new AttachmentData({
    base64:
      'eyJzY2hlbWFfaWQiOiJhYWEiLCJjcmVkX2RlZl9pZCI6IlRoN01wVGFSWlZSWW5QaWFiZHM4MVk6MzpDTDoxNzpUQUciLCJub25jZSI6Im5vbmNlIiwia2V5X2NvcnJlY3RuZXNzX3Byb29mIjp7fX0',
  }),
})

const requestAttachment = new Attachment({
  id: INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
  mimeType: 'application/json',
  data: new AttachmentData({
    base64: JsonEncoder.toBase64(credReq),
  }),
})

const credentialAttachment = new Attachment({
  id: INDY_CREDENTIAL_ATTACHMENT_ID,
  mimeType: 'application/json',
  data: new AttachmentData({
    base64: JsonEncoder.toBase64({
      values: IndyCredentialUtils.convertAttributesToValues(credentialPreview.attributes),
    }),
  }),
})

const credentialRequestMessage = new V1RequestCredentialMessage({
  comment: 'abcd',
  requestAttachments: [requestAttachment],
})
const credentialOfferMessage = new V1OfferCredentialMessage({
  comment: 'some comment',
  credentialPreview: credentialPreview,
  offerAttachments: [offerAttachment],
})
const credentialIssueMessage = new V1IssueCredentialMessage({
  comment: 'some comment',
  credentialAttachments: [offerAttachment],
})

const getAgentMessageMock = async (options: GetAgentMessageOptions<any>) => {
  if (options.messageClass === V1OfferCredentialMessage) {
    return credentialOfferMessage
  }
  if (options.messageClass === V1RequestCredentialMessage) {
    return credentialRequestMessage
  }
  if (options.messageClass === V1IssueCredentialMessage) {
    return credentialIssueMessage
  }

  throw new AriesFrameworkError('Could not find message')
}

// A record is deserialized to JSON when it's stored into the storage. We want to simulate this behaviour for `offer`
// object to test our service would behave correctly. We use type assertion for `offer` attribute to `any`.
const mockCredentialRecord = ({
  state,
  metadata,
  threadId,
  connectionId,
  tags,
  id,
  credentialAttributes,
  indyRevocationRegistryId,
  indyCredentialRevocationId,
}: {
  state?: CredentialState
  requestMessage?: V1RequestCredentialMessage
  metadata?: IndyCredentialViewMetadata & { indyRequest: Record<string, unknown> }
  tags?: CustomCredentialTags
  threadId?: string
  connectionId?: string
  credentialId?: string
  id?: string
  credentialAttributes?: CredentialPreviewAttribute[]
  indyRevocationRegistryId?: string
  indyCredentialRevocationId?: string
} = {}) => {
  const credentialRecord = new CredentialExchangeRecord({
    id,
    credentialAttributes: credentialAttributes || credentialPreview.attributes,
    state: state || CredentialState.OfferSent,
    threadId: threadId ?? uuid(),
    connectionId: connectionId ?? '123',
    credentials: [
      {
        credentialRecordType: 'indy',
        credentialRecordId: '123456',
      },
    ],
    tags,
    protocolVersion: 'v1',
  })

  if (metadata?.indyRequest) {
    credentialRecord.metadata.set(CredentialMetadataKeys.IndyRequest, { ...metadata.indyRequest })
  }

  if (metadata?.schemaId) {
    credentialRecord.metadata.add(CredentialMetadataKeys.IndyCredential, {
      schemaId: metadata.schemaId,
    })
  }

  if (metadata?.credentialDefinitionId) {
    credentialRecord.metadata.add(CredentialMetadataKeys.IndyCredential, {
      credentialDefinitionId: metadata.credentialDefinitionId,
    })
  }

  if (indyCredentialRevocationId || indyRevocationRegistryId) {
    credentialRecord.metadata.add(CredentialMetadataKeys.IndyCredential, {
      indyCredentialRevocationId,
      indyRevocationRegistryId,
    })
  }

  return credentialRecord
}

describe('V1CredentialService', () => {
  let eventEmitter: EventEmitter
  let agentConfig: AgentConfig
  let logger: Logger
  let credentialService: V1CredentialService

  beforeEach(async () => {
    // real objects
    agentConfig = getAgentConfig('CredentialServiceTest')
    eventEmitter = new EventEmitter(agentConfig)
    logger = agentConfig.logger

    // mock function implementations
    mockFunction(connectionService.getById).mockResolvedValue(connection)
    mockFunction(connectionService.assertConnectionOrServiceDecorator).mockReturnValue()
    mockFunction(indyLedgerService.getCredentialDefinition).mockReturnValue(Promise.resolve(credDef))
    mockFunction(indyLedgerService.getCredentialDefinition).mockReturnValue(Promise.resolve(credDef))
    mockFunction(indyLedgerService.getSchema).mockReturnValue(Promise.resolve(schema))
    mockFunction(didCommMessageRepository.findAgentMessage).mockImplementation(getAgentMessageMock)
    mockFunction(didCommMessageRepository.getAgentMessage).mockImplementation(getAgentMessageMock)

    credentialService = new V1CredentialService(
      connectionService,
      didCommMessageRepository,
      agentConfig,
      mediationRecipientService,
      dispatcher,
      eventEmitter,
      credentialRepository,
      indyCredentialFormatService
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('acceptOffer', () => {
    test(`calls the format service and updates state to ${CredentialState.RequestSent}`, async () => {
      const credentialRecord = mockCredentialRecord({
        id: '84353745-8bd9-42e1-8d81-238ca77c29d2',
        state: CredentialState.OfferReceived,
        threadId: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
      })

      const credentialFormats = {
        indy: {
          holderDid: 'did:sov:123456789abcdefghi',
        },
      }

      // mock resolved format call
      mockFunction(indyCredentialFormatService.acceptOffer).mockResolvedValue({
        attachment: requestAttachment,
        format: new CredentialFormatSpec({
          format: 'indy',
          attachId: INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
        }),
      })

      // when
      const { message } = await credentialService.acceptOffer({
        comment: 'hello',
        autoAcceptCredential: AutoAcceptCredential.Never,
        credentialRecord,
        credentialFormats,
      })

      // then
      expect(credentialRecord).toMatchObject({
        state: CredentialState.RequestSent,
        autoAcceptCredential: AutoAcceptCredential.Never,
      })
      expect(message).toBeInstanceOf(V1RequestCredentialMessage)
      expect(message.toJSON()).toMatchObject({
        '@id': expect.any(String),
        '@type': 'https://didcomm.org/issue-credential/1.0/request-credential',
        comment: 'hello',
        '~thread': {
          thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
        },
        'requests~attach': [JsonTransformer.toJSON(requestAttachment)],
      })
      expect(credentialRepository.update).toHaveBeenCalledTimes(1)
      expect(indyCredentialFormatService.acceptOffer).toHaveBeenCalledWith({
        credentialRecord,
        attachId: INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
        offerAttachment,
        credentialFormats: {
          indy: {
            holderDid: 'did:sov:123456789abcdefghi',
          },
        },
      })
      expect(didCommMessageRepository.saveOrUpdateAgentMessage).toHaveBeenCalledWith({
        agentMessage: message,
        associatedRecordId: '84353745-8bd9-42e1-8d81-238ca77c29d2',
        role: DidCommMessageRole.Sender,
      })
    })

    test(`calls updateState to update the state to ${CredentialState.RequestSent}`, async () => {
      const credentialRecord = mockCredentialRecord({
        state: CredentialState.OfferReceived,
      })

      const updateStateSpy = jest.spyOn(credentialService, 'updateState')

      // mock resolved format call
      mockFunction(indyCredentialFormatService.acceptOffer).mockResolvedValue({
        attachment: requestAttachment,
        format: new CredentialFormatSpec({
          format: 'indy',
          attachId: INDY_CREDENTIAL_REQUEST_ATTACHMENT_ID,
        }),
      })

      // when
      await credentialService.acceptOffer({
        credentialRecord,
      })

      // then
      expect(updateStateSpy).toHaveBeenCalledWith(credentialRecord, CredentialState.RequestSent)
    })

    const validState = CredentialState.OfferReceived
    const invalidCredentialStates = Object.values(CredentialState).filter((state) => state !== validState)
    test(`throws an error when state transition is invalid`, async () => {
      await Promise.all(
        invalidCredentialStates.map(async (state) => {
          await expect(
            credentialService.acceptOffer({ credentialRecord: mockCredentialRecord({ state }) })
          ).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`)
        })
      )
    })
  })

  describe('processCredentialRequest', () => {
    let credential: CredentialExchangeRecord
    let messageContext: InboundMessageContext<V1RequestCredentialMessage>
    beforeEach(() => {
      credential = mockCredentialRecord({ state: CredentialState.OfferSent })

      const credentialRequest = new V1RequestCredentialMessage({
        comment: 'abcd',
        requestAttachments: [requestAttachment],
      })
      credentialRequest.setThread({ threadId: 'somethreadid' })
      messageContext = new InboundMessageContext(credentialRequest, {
        connection,
      })
    })

    test(`updates state to ${CredentialState.RequestReceived}, set request and returns credential record`, async () => {
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // given
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))

      // when
      const returnedCredentialRecord = await credentialService.processRequest(messageContext)

      // then
      expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, {
        threadId: 'somethreadid',
        connectionId: connection.id,
      })
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      expect(returnedCredentialRecord.state).toEqual(CredentialState.RequestReceived)
    })

    test(`emits stateChange event from ${CredentialState.OfferSent} to ${CredentialState.RequestReceived}`, async () => {
      const eventListenerMock = jest.fn()
      eventEmitter.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, eventListenerMock)
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))

      // mock offer so that the request works
      const returnedCredentialRecord = await credentialService.processRequest(messageContext)

      // then
      expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, {
        threadId: 'somethreadid',
        connectionId: connection.id,
      })
      expect(returnedCredentialRecord.state).toEqual(CredentialState.RequestReceived)
    })

    const validState = CredentialState.OfferSent
    const invalidCredentialStates = Object.values(CredentialState).filter((state) => state !== validState)
    test(`throws an error when state transition is invalid`, async () => {
      await Promise.all(
        invalidCredentialStates.map(async (state) => {
          mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(
            Promise.resolve(mockCredentialRecord({ state }))
          )
          await expect(credentialService.processRequest(messageContext)).rejects.toThrowError(
            `Credential record is in invalid state ${state}. Valid states are: ${validState}.`
          )
        })
      )
    })
  })

  describe('createCredential', () => {
    const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746'
    let credential: CredentialExchangeRecord
    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.RequestReceived,
        requestMessage: new V1RequestCredentialMessage({
          comment: 'abcd',
          requestAttachments: [requestAttachment],
        }),
        threadId,
        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
      })
    })
    test(`updates state to ${CredentialState.CredentialIssued}`, async () => {
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // when
      await credentialService.acceptRequest({ credentialRecord: credential })

      // then
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      const [[updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls
      expect(updatedCredentialRecord).toMatchObject({
        state: CredentialState.CredentialIssued,
      })
    })

    test(`emits stateChange event from ${CredentialState.RequestReceived} to ${CredentialState.CredentialIssued}`, async () => {
      const eventListenerMock = jest.fn()

      // given
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credential))
      eventEmitter.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, eventListenerMock)

      // when
      await credentialService.acceptRequest({ credentialRecord: credential })

      // then
      expect(eventListenerMock).toHaveBeenCalledWith({
        type: 'CredentialStateChanged',
        payload: {
          previousState: CredentialState.RequestReceived,
          credentialRecord: expect.objectContaining({
            state: CredentialState.CredentialIssued,
          }),
        },
      })
    })

    test('returns credential response message base on credential request message', async () => {
      // given
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credential))
      const comment = 'credential response comment'

      // when

      const { message: credentialResponse } = await credentialService.acceptRequest({ credentialRecord: credential })
      // then
      expect(credentialResponse.toJSON()).toMatchObject({
        '@id': expect.any(String),
        '@type': 'https://didcomm.org/issue-credential/1.0/issue-credential',
        '~thread': {
          thid: credential.threadId,
        },
        comment,
        'credentials~attach': [
          {
            '@id': expect.any(String),
            'mime-type': 'application/json',
            data: {
              base64: expect.any(String),
            },
          },
        ],
        '~please_ack': expect.any(Object),
      })

      // Value of `cred` should be as same as in the credential response message.
      const [cred] = await indyIssuerService.createCredential({
        credentialOffer: credOffer,
        credentialRequest: credReq,
        credentialValues: {},
      })
      const [responseAttachment] = credentialResponse.credentialAttachments
      expect(responseAttachment.getDataAsJson()).toEqual(cred)
    })
  })

  describe('processCredential', () => {
    let credential: CredentialExchangeRecord
    let messageContext: InboundMessageContext<V1IssueCredentialMessage>
    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.RequestSent,
        requestMessage: new V1RequestCredentialMessage({
          requestAttachments: [requestAttachment],
        }),
        metadata: { indyRequest: { cred_req: 'meta-data' } },
      })

      const credentialResponse = new V1IssueCredentialMessage({
        comment: 'abcd',
        credentialAttachments: [credentialAttachment],
      })
      credentialResponse.setThread({ threadId: 'somethreadid' })
      messageContext = new InboundMessageContext(credentialResponse, {
        connection,
      })
    })

    test('finds credential record by thread ID and saves credential attachment into the wallet', async () => {
      const storeCredentialMock = indyHolderService.storeCredential as jest.Mock<
        Promise<string>,
        [StoreCredentialOptions]
      >
      // given
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))
      // when
      await credentialService.processCredential(messageContext)

      // then
      expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, {
        threadId: 'somethreadid',
        connectionId: connection.id,
      })

      expect(storeCredentialMock).toHaveBeenNthCalledWith(1, {
        credentialId: expect.any(String),
        credentialRequestMetadata: { cred_req: 'meta-data' },
        credential: messageContext.message.indyCredential,
        credentialDefinition: credDef,
      })
    })
  })

  describe('acceptCredential', () => {
    const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746'
    let credential: CredentialExchangeRecord

    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.CredentialReceived,
        threadId,
        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
      })
    })

    test(`updates state to ${CredentialState.Done}`, async () => {
      // given
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // when
      await credentialService.acceptCredential({ credentialRecord: credential })

      // then
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      const [[updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls
      expect(updatedCredentialRecord).toMatchObject({
        state: CredentialState.Done,
      })
    })

    test(`emits stateChange event from ${CredentialState.CredentialReceived} to ${CredentialState.Done}`, async () => {
      const eventListenerMock = jest.fn()
      eventEmitter.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, eventListenerMock)

      // when
      await credentialService.acceptCredential({ credentialRecord: credential })

      // then
      expect(eventListenerMock).toHaveBeenCalledWith({
        type: 'CredentialStateChanged',
        payload: {
          previousState: CredentialState.CredentialReceived,
          credentialRecord: expect.objectContaining({
            state: CredentialState.Done,
          }),
        },
      })
    })

    test('returns credential response message base on credential request message', async () => {
      // given
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credential))

      // when
      const { message: ackMessage } = await credentialService.acceptCredential({ credentialRecord: credential })

      // then
      expect(ackMessage.toJSON()).toMatchObject({
        '@id': expect.any(String),
        '@type': 'https://didcomm.org/issue-credential/1.0/ack',
        '~thread': {
          thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
        },
      })
    })

    const validState = CredentialState.CredentialReceived
    const invalidCredentialStates = Object.values(CredentialState).filter((state) => state !== validState)
    test(`throws an error when state transition is invalid`, async () => {
      await Promise.all(
        invalidCredentialStates.map(async (state) => {
          await expect(
            credentialService.acceptCredential({
              credentialRecord: mockCredentialRecord({
                state,
                threadId,
                connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
              }),
            })
          ).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`)
        })
      )
    })
  })

  describe('processAck', () => {
    let credential: CredentialExchangeRecord
    let messageContext: InboundMessageContext<V1CredentialAckMessage>

    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.CredentialIssued,
      })

      const credentialRequest = new V1CredentialAckMessage({
        status: AckStatus.OK,
        threadId: 'somethreadid',
      })
      messageContext = new InboundMessageContext(credentialRequest, {
        connection,
      })
    })

    test(`updates state to ${CredentialState.Done} and returns credential record`, async () => {
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // given
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))

      // when
      const returnedCredentialRecord = await credentialService.processAck(messageContext)

      // then
      const expectedCredentialRecord = {
        state: CredentialState.Done,
      }
      expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, {
        threadId: 'somethreadid',
        connectionId: connection.id,
      })
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      const [[updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls
      expect(updatedCredentialRecord).toMatchObject(expectedCredentialRecord)
      expect(returnedCredentialRecord).toMatchObject(expectedCredentialRecord)
    })
  })

  describe('createProblemReport', () => {
    const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249746'
    let credential: CredentialExchangeRecord

    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.OfferReceived,
        threadId,
        connectionId: 'b1e2f039-aa39-40be-8643-6ce2797b5190',
      })
    })

    test('returns problem report message base once get error', async () => {
      // given
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credential))

      // when
      const credentialProblemReportMessage = new V1CredentialProblemReportMessage({
        description: {
          en: 'Indy error',
          code: CredentialProblemReportReason.IssuanceAbandoned,
        },
      })

      credentialProblemReportMessage.setThread({ threadId })
      // then
      expect(credentialProblemReportMessage.toJSON()).toMatchObject({
        '@id': expect.any(String),
        '@type': 'https://didcomm.org/issue-credential/1.0/problem-report',
        '~thread': {
          thid: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
        },
      })
    })
  })

  describe('processProblemReport', () => {
    let credential: CredentialExchangeRecord
    let messageContext: InboundMessageContext<V1CredentialProblemReportMessage>

    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.OfferReceived,
      })

      const credentialProblemReportMessage = new V1CredentialProblemReportMessage({
        description: {
          en: 'Indy error',
          code: CredentialProblemReportReason.IssuanceAbandoned,
        },
      })
      credentialProblemReportMessage.setThread({ threadId: 'somethreadid' })
      messageContext = new InboundMessageContext(credentialProblemReportMessage, {
        connection,
      })
    })

    test(`updates problem report error message and returns credential record`, async () => {
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // given
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))

      // when
      const returnedCredentialRecord = await credentialService.processProblemReport(messageContext)

      // then
      const expectedCredentialRecord = {
        errorMessage: 'issuance-abandoned: Indy error',
      }
      expect(credentialRepository.getSingleByQuery).toHaveBeenNthCalledWith(1, {
        threadId: 'somethreadid',
        connectionId: connection.id,
      })
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      const [[updatedCredentialRecord]] = repositoryUpdateSpy.mock.calls
      expect(updatedCredentialRecord).toMatchObject(expectedCredentialRecord)
      expect(returnedCredentialRecord).toMatchObject(expectedCredentialRecord)
    })
  })

  describe('repository methods', () => {
    it('getById should return value from credentialRepository.getById', async () => {
      const expected = mockCredentialRecord()
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(expected))
      const result = await credentialService.getById(expected.id)
      expect(credentialRepository.getById).toBeCalledWith(expected.id)

      expect(result).toBe(expected)
    })

    it('getById should return value from credentialRepository.getSingleByQuery', async () => {
      const expected = mockCredentialRecord()
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(expected))
      const result = await credentialService.getByThreadAndConnectionId('threadId', 'connectionId')
      expect(credentialRepository.getSingleByQuery).toBeCalledWith({
        threadId: 'threadId',
        connectionId: 'connectionId',
      })

      expect(result).toBe(expected)
    })

    it('findById should return value from credentialRepository.findById', async () => {
      const expected = mockCredentialRecord()
      mockFunction(credentialRepository.findById).mockReturnValue(Promise.resolve(expected))
      const result = await credentialService.findById(expected.id)
      expect(credentialRepository.findById).toBeCalledWith(expected.id)

      expect(result).toBe(expected)
    })

    it('getAll should return value from credentialRepository.getAll', async () => {
      const expected = [mockCredentialRecord(), mockCredentialRecord()]

      mockFunction(credentialRepository.getAll).mockReturnValue(Promise.resolve(expected))
      const result = await credentialService.getAll()
      expect(credentialRepository.getAll).toBeCalledWith()

      expect(result).toEqual(expect.arrayContaining(expected))
    })
  })

  describe('deleteCredential', () => {
    it('should call delete from repository', async () => {
      const credentialRecord = mockCredentialRecord()
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credentialRecord))

      const repositoryDeleteSpy = jest.spyOn(credentialRepository, 'delete')
      await credentialService.delete(credentialRecord)
      expect(repositoryDeleteSpy).toHaveBeenNthCalledWith(1, credentialRecord)
    })

    it('deleteAssociatedCredential parameter should call deleteCredential in indyHolderService with credentialId', async () => {
      const deleteCredentialMock = mockFunction(indyHolderService.deleteCredential)
      const credentialRecord = mockCredentialRecord()
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credentialRecord))

      await credentialService.delete(credentialRecord, {
        deleteAssociatedCredentials: true,
      })
      expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, credentialRecord.credentials[0].credentialRecordId)
    })

    it('deleteAssociatedCredentials not set - defaults to true , credential still deleted by default', async () => {
      const deleteCredentialMock = mockFunction(indyHolderService.deleteCredential)

      const credentialRecord = mockCredentialRecord()
      mockFunction(credentialRepository.getById).mockReturnValue(Promise.resolve(credentialRecord))

      // deleteAssociatedCredentials not set - defaults to true
      await credentialService.delete(credentialRecord)
      expect(deleteCredentialMock).toHaveBeenNthCalledWith(1, credentialRecord.credentials[0].credentialRecordId)
    })
  })

  describe('declineOffer', () => {
    const threadId = 'fd9c5ddb-ec11-4acd-bc32-540736249754'
    let credential: CredentialExchangeRecord

    beforeEach(() => {
      credential = mockCredentialRecord({
        state: CredentialState.OfferReceived,
        tags: { threadId },
      })
    })

    test(`updates state to ${CredentialState.Declined}`, async () => {
      // given
      const repositoryUpdateSpy = jest.spyOn(credentialRepository, 'update')

      // when
      await credentialService.declineOffer(credential)

      // then
      const expectedCredentialState = {
        state: CredentialState.Declined,
      }
      expect(repositoryUpdateSpy).toHaveBeenCalledTimes(1)
      expect(repositoryUpdateSpy).toHaveBeenNthCalledWith(1, expect.objectContaining(expectedCredentialState))
    })

    test(`emits stateChange event from ${CredentialState.OfferReceived} to ${CredentialState.Declined}`, async () => {
      const eventListenerMock = jest.fn()
      eventEmitter.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, eventListenerMock)

      // given
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.resolve(credential))

      // when
      await credentialService.declineOffer(credential)

      // then
      expect(eventListenerMock).toHaveBeenCalledTimes(1)
      const [[event]] = eventListenerMock.mock.calls
      expect(event).toMatchObject({
        type: 'CredentialStateChanged',
        payload: {
          previousState: CredentialState.OfferReceived,
          credentialRecord: expect.objectContaining({
            state: CredentialState.Declined,
          }),
        },
      })
    })

    const validState = CredentialState.OfferReceived
    const invalidCredentialStates = Object.values(CredentialState).filter((state) => state !== validState)
    test(`throws an error when state transition is invalid`, async () => {
      await Promise.all(
        invalidCredentialStates.map(async (state) => {
          await expect(
            credentialService.declineOffer(mockCredentialRecord({ state, tags: { threadId } }))
          ).rejects.toThrowError(`Credential record is in invalid state ${state}. Valid states are: ${validState}.`)
        })
      )
    })
  })
})
