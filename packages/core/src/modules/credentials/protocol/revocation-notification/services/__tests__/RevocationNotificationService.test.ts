import { RevocationNotificationReceivedEvent, CredentialEventTypes } from '../../../../CredentialEvents'
import { RecordNotFoundError, AriesFrameworkError } from '../../../../../../error'
import { getAgentConfig, getBaseConfig, getMockConnection, mockFunction } from '../../../../../../../tests/helpers'
import logger from '../../../../../../../tests/logger'
import { ConnectionRecord, DidExchangeState } from '../../../../../connections'
import { V1RevocationNotificationMessage, V2RevocationNotificationMessage } from '../../messages'
import { CredentialExchangeRecord, CredentialState, InboundMessageContext } from '../../../../../..'
import { RevocationNotificationService } from '../RevocationNotificationService'
import { CredentialRepository } from '../../../../repository/CredentialRepository'
import { EventEmitter } from '../../../../../../agent/EventEmitter'
import { Dispatcher } from '../../../../../../agent/Dispatcher'
import { CredentialMetadataKeys } from '../../../../repository'

jest.mock('../../../../repository/CredentialRepository')
const CredentialRepositoryMock = CredentialRepository as jest.Mock<CredentialRepository>
const credentialRepository = new CredentialRepositoryMock()

jest.mock('../../../../../../agent/Dispatcher')
const DispatcherMock = Dispatcher as jest.Mock<Dispatcher>
const dispatcher = new DispatcherMock()

const connection = getMockConnection({
  state: DidExchangeState.Completed,
})

describe('RevocationNotificationService', () => {
  let credentialRecord: CredentialExchangeRecord
  let revocationNotificationService: RevocationNotificationService
  let eventEmitter: EventEmitter

  beforeEach(() => {
    const agentConfig = getAgentConfig('RevocationNotificationService', {
      indyLedgers: [],
    })

    credentialRecord = new CredentialExchangeRecord({
      threadId: 'thread-id',
      protocolVersion: 'v1',
      state: CredentialState.Done,
    })

    credentialRecord.metadata.set(CredentialMetadataKeys.IndyCredential, {
      indyRevocationRegistryId:
        'AsB27X6KRrJFsqZ3unNAH6:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9',
      indyCredentialRevocationId: '1',
    })

    eventEmitter = new EventEmitter(agentConfig)
    revocationNotificationService = new RevocationNotificationService(
      credentialRepository,
      eventEmitter,
      agentConfig,
      dispatcher
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Test revocation notification event being emitted for V1', async () => {
    const eventListenerMock = jest.fn()
    eventEmitter.on<RevocationNotificationReceivedEvent>(
      CredentialEventTypes.RevocationNotificationReceived,
      eventListenerMock
    )
    const date = new Date(2022)

    mockFunction(credentialRepository.getSingleByQuery).mockReturnValueOnce(Promise.resolve(credentialRecord))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => date)

    const { indyRevocationRegistryId, indyCredentialRevocationId } = credentialRecord.getTags()
    const revocationNotificationThreadId = `indy::${indyRevocationRegistryId}::${indyCredentialRevocationId}`

    const revocationNotificationMessage = new V1RevocationNotificationMessage({
      issueThread: revocationNotificationThreadId,
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage, {
      connection,
    })

    await revocationNotificationService.v1ProcessRevocationNotification(messageContext)

    expect(eventListenerMock).toHaveBeenCalledWith({
      type: 'RevocationNotificationReceived',
      payload: {
        credentialRecord: {
          ...credentialRecord,
          revocationNotification: {
            revocationDate: date,
            comment: 'Credential has been revoked',
          },
        },
      },
    })

    spy.mockRestore()
  })

  test('Error is logged when no matching credential found for revocation notification V1', async () => {
    const loggerSpy = jest.spyOn(logger, 'warn')

    const revocationRegistryId =
      'ABC12D3EFgHIjKL4mnOPQ5:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9'
    const credentialRevocationId = '2'
    const revocationNotificationThreadId = `indy::${revocationRegistryId}::${credentialRevocationId}`
    const recordNotFoundError = new RecordNotFoundError(
      `No record found for given query '${JSON.stringify({ revocationRegistryId, credentialRevocationId })}'`,
      {
        recordType: CredentialExchangeRecord.type,
      }
    )

    mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.reject(recordNotFoundError))

    const revocationNotificationMessage = new V1RevocationNotificationMessage({
      issueThread: revocationNotificationThreadId,
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage, { connection })

    await revocationNotificationService.v1ProcessRevocationNotification(messageContext)

    expect(loggerSpy).toBeCalledWith('Failed to process revocation notification message', {
      error: recordNotFoundError,
      threadId: revocationNotificationThreadId,
    })
  })

  test('Error is logged when invalid threadId is passed for revocation notification V1', async () => {
    const loggerSpy = jest.spyOn(logger, 'warn')

    const revocationNotificationThreadId = 'notIndy::invalidRevRegId::invalidCredRevId'
    const invalidThreadFormatError = new AriesFrameworkError(
      `Incorrect revocation notification threadId format: \n${revocationNotificationThreadId}\ndoes not match\n"indy::<revocation_registry_id>::<credential_revocation_id>"`
    )

    const revocationNotificationMessage = new V1RevocationNotificationMessage({
      issueThread: revocationNotificationThreadId,
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage)

    await revocationNotificationService.v1ProcessRevocationNotification(messageContext)

    expect(loggerSpy).toBeCalledWith('Failed to process revocation notification message', {
      error: invalidThreadFormatError,
      threadId: revocationNotificationThreadId,
    })
  })

  test('Test revocation notification event being emitted for V2', async () => {
    const eventListenerMock = jest.fn()
    eventEmitter.on<RevocationNotificationReceivedEvent>(
      CredentialEventTypes.RevocationNotificationReceived,
      eventListenerMock
    )
    const date = new Date(2022)

    mockFunction(credentialRepository.getSingleByQuery).mockReturnValueOnce(Promise.resolve(credentialRecord))

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => date)

    const { indyRevocationRegistryId, indyCredentialRevocationId } = credentialRecord.getTags()
    const revocationNotificationCredentialId = `${indyRevocationRegistryId}::${indyCredentialRevocationId}`

    const revocationNotificationMessage = new V2RevocationNotificationMessage({
      credentialId: revocationNotificationCredentialId,
      revocationFormat: 'indy',
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage, {
      connection,
    })

    await revocationNotificationService.v2ProcessRevocationNotification(messageContext)

    expect(eventListenerMock).toHaveBeenCalledWith({
      type: 'RevocationNotificationReceived',
      payload: {
        credentialRecord: {
          ...credentialRecord,
          revocationNotification: {
            revocationDate: date,
            comment: 'Credential has been revoked',
          },
        },
      },
    })

    spy.mockRestore()
  })

  test('Error is logged when no matching credential found for revocation notification V2', async () => {
    const loggerSpy = jest.spyOn(logger, 'warn')

    const revocationRegistryId =
      'ABC12D3EFgHIjKL4mnOPQ5:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:default:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9'
    const credentialRevocationId = '2'
    const credentialId = `${revocationRegistryId}::${credentialRevocationId}`

    const recordNotFoundError = new RecordNotFoundError(
      `No record found for given  query '${JSON.stringify({ revocationRegistryId, credentialRevocationId })}'`,
      {
        recordType: CredentialExchangeRecord.type,
      }
    )

    mockFunction(credentialRepository.getSingleByQuery).mockReturnValue(Promise.reject(recordNotFoundError))

    const revocationNotificationMessage = new V2RevocationNotificationMessage({
      credentialId,
      revocationFormat: 'indy',
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage, { connection })

    await revocationNotificationService.v2ProcessRevocationNotification(messageContext)

    expect(loggerSpy).toBeCalledWith('Failed to process revocation notification message', {
      error: recordNotFoundError,
      credentialId,
    })
  })

  test('Error is logged when invalid credentialId is passed for revocation notification V2', async () => {
    const loggerSpy = jest.spyOn(logger, 'warn')

    const invalidCredentialId = 'notIndy::invalidRevRegId::invalidCredRevId'
    const invalidFormatError = new AriesFrameworkError(
      `Incorrect revocation notification credentialId format: \n${invalidCredentialId}\ndoes not match\n"<revocation_registry_id>::<credential_revocation_id>"`
    )

    const revocationNotificationMessage = new V2RevocationNotificationMessage({
      credentialId: invalidCredentialId,
      revocationFormat: 'indy',
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage)

    await revocationNotificationService.v2ProcessRevocationNotification(messageContext)

    expect(loggerSpy).toBeCalledWith('Failed to process revocation notification message', {
      error: invalidFormatError,
      credentialId: invalidCredentialId,
    })
  })

  test('Test error being thrown when connection does not match issuer', async () => {
    const loggerSpy = jest.spyOn(logger, 'warn')
    const date = new Date(2022)

    const error = new AriesFrameworkError(
      "Credential record is associated with connection '123'. Current connection is 'fd9c5ddb-ec11-4acd-bc32-540736249746'"
    )

    mockFunction(credentialRepository.getSingleByQuery).mockReturnValueOnce(Promise.resolve(credentialRecord))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const spy = jest.spyOn(global, 'Date').mockImplementation(() => date)

    const { indyRevocationRegistryId, indyCredentialRevocationId } = credentialRecord.getTags()
    const revocationNotificationThreadId = `indy::${indyRevocationRegistryId}::${indyCredentialRevocationId}`

    const revocationNotificationMessage = new V1RevocationNotificationMessage({
      issueThread: revocationNotificationThreadId,
      comment: 'Credential has been revoked',
    })
    const messageContext = new InboundMessageContext(revocationNotificationMessage, {
      connection: {
        id: 'fd9c5ddb-ec11-4acd-bc32-540736249746',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        assertReady: () => {},
      } as ConnectionRecord,
    })

    await revocationNotificationService.v1ProcessRevocationNotification(messageContext)

    expect(loggerSpy).toBeCalledWith('Failed to process revocation notification message', {
      error,
      threadId: revocationNotificationThreadId,
    })

    spy.mockRestore()
  })

  describe('revocation registry id validation', () => {
    const revocationRegistryId =
      'ABC12D3EFgHIjKL4mnOPQ5:4:AsB27X6KRrJFsqZ3unNAH6:3:cl:48187:N4s7y-5hema_tag ;:CL_ACCUM:3b24a9b0-a979-41e0-9964-2292f2b1b7e9'
    test('V1 allows any character in tag part of RevRegId', async () => {
      const loggerSpy = jest.spyOn(logger, 'warn')
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValueOnce(Promise.resolve(credentialRecord))

      const revocationNotificationThreadId = `indy::${revocationRegistryId}::2`

      const invalidThreadFormatError = new AriesFrameworkError(
        `Incorrect revocation notification threadId format: \n${revocationNotificationThreadId}\ndoes not match\n"indy::<revocation_registry_id>::<credential_revocation_id>"`
      )

      const revocationNotificationMessage = new V1RevocationNotificationMessage({
        issueThread: revocationNotificationThreadId,
        comment: 'Credential has been revoked',
      })
      const messageContext = new InboundMessageContext(revocationNotificationMessage)

      await revocationNotificationService.v1ProcessRevocationNotification(messageContext)

      expect(loggerSpy).not.toBeCalledWith('Failed to process revocation notification message', {
        error: invalidThreadFormatError,
        threadId: revocationNotificationThreadId,
      })
    })

    test('V2 allows any character in tag part of credential id', async () => {
      const loggerSpy = jest.spyOn(logger, 'warn')
      mockFunction(credentialRepository.getSingleByQuery).mockReturnValueOnce(Promise.resolve(credentialRecord))

      const credentialId = `${revocationRegistryId}::2`
      const invalidFormatError = new AriesFrameworkError(
        `Incorrect revocation notification credentialId format: \n${credentialId}\ndoes not match\n"<revocation_registry_id>::<credential_revocation_id>"`
      )

      const revocationNotificationMessage = new V2RevocationNotificationMessage({
        credentialId: credentialId,
        revocationFormat: 'indy',
        comment: 'Credenti1al has been revoked',
      })
      const messageContext = new InboundMessageContext(revocationNotificationMessage)

      await revocationNotificationService.v2ProcessRevocationNotification(messageContext)

      expect(loggerSpy).not.toBeCalledWith('Failed to process revocation notification message', {
        error: invalidFormatError,
        credentialId: credentialId,
      })
    })
  })
})
