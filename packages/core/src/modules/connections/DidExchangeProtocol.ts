import type { AgentContext } from '../../agent'
import type { InboundMessageContext } from '../../agent/models/InboundMessageContext'
import type { ParsedMessageType } from '../../utils/messageType'
import type { ResolvedDidCommService } from '../didcomm'
import type { PeerDidCreateOptions } from '../dids'
import type { OutOfBandRecord } from '../oob/repository'
import type { ConnectionRecord } from './repository'
import type { Routing } from './services/ConnectionService'

import { InjectionSymbols } from '../../constants'
import { Key, KeyType } from '../../crypto'
import { JwsService } from '../../crypto/JwsService'
import { Attachment, AttachmentData } from '../../decorators/attachment/Attachment'
import { AriesFrameworkError } from '../../error'
import { Logger } from '../../logger'
import { inject, injectable } from '../../plugins'
import { JsonEncoder } from '../../utils/JsonEncoder'
import { JsonTransformer } from '../../utils/JsonTransformer'
import { DidCommDocumentService } from '../didcomm'
import {
  isValidPeerDid,
  DidDocument,
  DidRegistrarService,
  createPeerDidDocumentFromServices,
  DidKey,
  getNumAlgoFromPeerDid,
  PeerDidNumAlgo,
  DidResolverService,
} from '../dids'
import { getKeyDidMappingByVerificationMethod } from '../dids/domain/key-type'
import { didKeyToInstanceOfKey } from '../dids/helpers'
import { didDocumentJsonToNumAlgo1Did } from '../dids/methods/peer/peerDidNumAlgo1'
import { DidRepository } from '../dids/repository'
import { OutOfBandRole } from '../oob/domain/OutOfBandRole'
import { OutOfBandState } from '../oob/domain/OutOfBandState'
import { RoutingService } from '../routing/services/RoutingService'

import { DidExchangeStateMachine } from './DidExchangeStateMachine'
import { DidExchangeProblemReportError, DidExchangeProblemReportReason } from './errors'
import { DidExchangeCompleteMessage } from './messages/DidExchangeCompleteMessage'
import { DidExchangeRequestMessage } from './messages/DidExchangeRequestMessage'
import { DidExchangeResponseMessage } from './messages/DidExchangeResponseMessage'
import { DidExchangeRole, DidExchangeState, HandshakeProtocol } from './models'
import { ConnectionService } from './services'

interface DidExchangeRequestParams {
  label?: string
  alias?: string
  goal?: string
  goalCode?: string
  did?: string
  autoAcceptConnection?: boolean
}

@injectable()
export class DidExchangeProtocol {
  private connectionService: ConnectionService
  private didRegistrarService: DidRegistrarService
  private didResolverService: DidResolverService
  private jwsService: JwsService
  private didRepository: DidRepository
  private logger: Logger
  private routingService: RoutingService
  private didCommDocumentService: DidCommDocumentService

  public constructor(
    connectionService: ConnectionService,
    didRegistrarService: DidRegistrarService,
    didResolverService: DidResolverService,
    didRepository: DidRepository,
    jwsService: JwsService,
    @inject(InjectionSymbols.Logger) logger: Logger,
    routingService: RoutingService,
    didCommDocumentService: DidCommDocumentService
  ) {
    this.connectionService = connectionService
    this.didRegistrarService = didRegistrarService
    this.didResolverService = didResolverService
    this.didRepository = didRepository
    this.jwsService = jwsService
    this.logger = logger
    this.routingService = routingService
    this.didCommDocumentService = didCommDocumentService
  }

  public async createRequest(
    agentContext: AgentContext,
    outOfBandRecord: OutOfBandRecord,
    params: DidExchangeRequestParams
  ): Promise<{ message: DidExchangeRequestMessage; connectionRecord: ConnectionRecord }> {
    this.logger.debug(`Create message ${DidExchangeRequestMessage.type.messageTypeUri} start`, {
      outOfBandRecord,
      params,
    })

    const { outOfBandInvitation } = outOfBandRecord
    const { alias, goal, goalCode, did, autoAcceptConnection } = params

    // TODO: We should store only one did that we'll use to send the request message with success.
    // We take just the first one for now.
    // FIXME: we should only use the first one for sending didcomm messages
    const [invitationDid] = outOfBandInvitation.invitationDids

    const connectionRecord = await this.connectionService.createConnection(agentContext, {
      protocol: HandshakeProtocol.DidExchange,
      role: DidExchangeRole.Requester,
      alias,
      state: DidExchangeState.InvitationReceived,
      theirLabel: outOfBandInvitation.label,
      mediatorId: outOfBandRecord.mediatorId,
      autoAcceptConnection: outOfBandRecord.autoAcceptConnection,
      outOfBandId: outOfBandRecord.id,
      invitationDid,
      did,
    })

    DidExchangeStateMachine.assertCreateMessageState(DidExchangeRequestMessage.type, connectionRecord)

    // Create message
    const label = params.label ?? agentContext.config.label

    let didDocument: DidDocument
    let didDocAttach: Attachment | undefined = undefined

    if (did) {
      // FIXME: check if did is created by us, and it contains a didcomm service?
      didDocument = await this.didResolverService.resolveDidDocument(agentContext, did)
    } else {
      // FIXME: we also need mediator routing for our custom public did
      const routing = await this.routingService.getRouting(agentContext, {
        mediatorId: connectionRecord.mediatorId,
      })

      didDocument = await this.createPeerDidDoc(agentContext, this.routingToServices(routing))

      // Create sign attachment containing didDoc
      if (getNumAlgoFromPeerDid(didDocument.id) === PeerDidNumAlgo.GenesisDoc) {
        didDocAttach = await this.createSignedAttachment(agentContext, didDocument, [
          routing.recipientKey.publicKeyBase58,
        ])
      }
    }

    const parentThreadId = outOfBandInvitation.id
    const message = new DidExchangeRequestMessage({ label, parentThreadId, did: didDocument.id, goal, goalCode })
    message.didDoc = didDocAttach

    connectionRecord.did = didDocument.id
    connectionRecord.threadId = message.id

    if (autoAcceptConnection !== undefined || autoAcceptConnection !== null) {
      connectionRecord.autoAcceptConnection = autoAcceptConnection
    }

    await this.updateState(agentContext, DidExchangeRequestMessage.type, connectionRecord)
    this.logger.debug(`Create message ${DidExchangeRequestMessage.type.messageTypeUri} end`, {
      connectionRecord,
      message,
    })
    return { message, connectionRecord }
  }

  public async processRequest(
    messageContext: InboundMessageContext<DidExchangeRequestMessage>,
    outOfBandRecord: OutOfBandRecord
  ): Promise<ConnectionRecord> {
    this.logger.debug(`Process message ${DidExchangeRequestMessage.type.messageTypeUri} start`, {
      message: messageContext.message,
    })

    outOfBandRecord.assertRole(OutOfBandRole.Sender)
    outOfBandRecord.assertState(OutOfBandState.AwaitResponse)

    // TODO check there is no connection record for particular oob record

    const { message } = messageContext

    // Check corresponding invitation ID is the request's ~thread.pthid
    if (!message.thread?.parentThreadId || message.thread?.parentThreadId !== outOfBandRecord.getTags().invitationId) {
      throw new DidExchangeProblemReportError('Missing reference to invitation.', {
        problemCode: DidExchangeProblemReportReason.RequestNotAccepted,
      })
    }

    let didDocument: DidDocument

    if (message.did.startsWith('did:peer:1')) {
      didDocument = await this.extractDidDocument(
        messageContext.agentContext,
        message,
        outOfBandRecord
          .getTags()
          .recipientKeyFingerprints.map((fingerprint) => Key.fromFingerprint(fingerprint).publicKeyBase58)
      )

      const didDocJson = message.didDoc?.getDataAsJson<Record<string, unknown>>()
      this.validateDidPeer1Did(message.did, didDocJson)
    } else if (message.didDoc) {
      throw new DidExchangeProblemReportError('DidDoc attachment is not supported for dids other than did:peer:1', {
        problemCode: DidExchangeProblemReportReason.RequestNotAccepted,
      })
    } else {
      didDocument = await this.didResolverService.resolveDidDocument(messageContext.agentContext, message.did)
    }

    await this.assertNoOtherDidsWithSameKeys(messageContext.agentContext, didDocument)

    // TODO: what to do with this?
    if (!messageContext.recipientKey) throw new AriesFrameworkError('Missing recipient key in message context')
    const invitationDid = await this.findInvitationDidForRecipientKey(
      messageContext.agentContext,
      outOfBandRecord.outOfBandInvitation.invitationDids,
      messageContext.recipientKey
    )
    // This verifies whether the connection request was sent to one of the services from the invitation (and not another key/did we own)
    if (!invitationDid) {
      throw new AriesFrameworkError(
        `Could not find invitation did for recipient key ${messageContext.recipientKey.fingerprint} from the invitation dids. The connection request must be sent to one of the dids or services from the out of band invitation`
      )
    }

    await this.didCommDocumentService.storeReceivedDidDocument(messageContext.agentContext, didDocument)
    const connectionRecord = await this.connectionService.createConnection(messageContext.agentContext, {
      protocol: HandshakeProtocol.DidExchange,
      role: DidExchangeRole.Responder,
      state: DidExchangeState.RequestReceived,
      alias: outOfBandRecord.alias,
      theirDid: message.did,
      theirLabel: message.label,
      threadId: message.threadId,
      mediatorId: outOfBandRecord.mediatorId,
      autoAcceptConnection: outOfBandRecord.autoAcceptConnection,
      outOfBandId: outOfBandRecord.id,
      invitationDid,
    })

    await this.updateState(messageContext.agentContext, DidExchangeRequestMessage.type, connectionRecord)
    this.logger.debug(`Process message ${DidExchangeRequestMessage.type.messageTypeUri} end`, connectionRecord)
    return connectionRecord
  }

  public async createResponse(
    agentContext: AgentContext,
    connectionRecord: ConnectionRecord,
    outOfBandRecord: OutOfBandRecord
  ): Promise<DidExchangeResponseMessage> {
    this.logger.debug(`Create message ${DidExchangeResponseMessage.type.messageTypeUri} start`, connectionRecord)
    DidExchangeStateMachine.assertCreateMessageState(DidExchangeResponseMessage.type, connectionRecord)

    const { threadId } = connectionRecord

    if (!threadId) {
      throw new AriesFrameworkError('Missing threadId on connection record.')
    }

    let didDocument: DidDocument

    const [connectionDid] = outOfBandRecord.outOfBandInvitation.getDidServices()

    // TODO: support flow where we want to create a new did:peer for the connection instead.
    // If a did was used for the oob invitation, we will use that same did for the connection response
    if (connectionDid) {
      didDocument = await this.didResolverService.resolveDidDocument(agentContext, connectionDid)

      // Checks if the did is valid to be used for a connection
      await this.assertNoOtherDidsWithSameKeys(agentContext, didDocument)
      await this.assertNoConnectionsWithDidPair(agentContext, {
        ourDid: connectionDid,
        theirDid: connectionRecord.theirDid as string,
      })
    }
    // If we haven't defined a did in the invitation, and the connection is reusable,
    // we want to create a new did:peer for each connection
    else if (outOfBandRecord.reusable) {
      const routing = await this.routingService.getRouting(agentContext, {
        mediatorId: outOfBandRecord.mediatorId,
      })

      const services = this.routingToServices(routing)
      didDocument = await this.createPeerDidDoc(agentContext, services)
    }
    // Otherwise we create a new did peer did for the connection
    else {
      const inlineServices = outOfBandRecord.outOfBandInvitation.getInlineServices()
      const services = inlineServices.map((service) => ({
        id: service.id,
        serviceEndpoint: service.serviceEndpoint,
        recipientKeys: service.recipientKeys.map(didKeyToInstanceOfKey),
        routingKeys: service.routingKeys?.map(didKeyToInstanceOfKey) ?? [],
      }))

      didDocument = createPeerDidDocumentFromServices(services)
      const peerDid = didDocumentJsonToNumAlgo1Did(didDocument.toJSON())

      // Checks if the peer did is valid
      await this.assertNoOtherDidsWithSameKeys(agentContext, didDocument)
      await this.assertNoConnectionsWithDidPair(agentContext, {
        ourDid: peerDid,
        theirDid: connectionRecord.theirDid as string,
      })

      didDocument = await this.createPeerDidDoc(agentContext, services)
    }

    const message = new DidExchangeResponseMessage({ did: didDocument.id, threadId })

    // Special handling for peer dids (we need to attach the did document)
    if (isValidPeerDid(didDocument.id) && getNumAlgoFromPeerDid(didDocument.id) === PeerDidNumAlgo.GenesisDoc) {
      const didDocAttach = await this.createSignedAttachment(
        agentContext,
        didDocument,
        Array.from(new Set(didDocument.recipientKeys.map((key) => key.publicKeyBase58)))
      )
      message.didDoc = didDocAttach
    }

    connectionRecord.did = didDocument.id

    await this.updateState(agentContext, DidExchangeResponseMessage.type, connectionRecord)
    this.logger.debug(`Create message ${DidExchangeResponseMessage.type.messageTypeUri} end`, {
      connectionRecord,
      message,
    })
    return message
  }

  public async processResponse(
    messageContext: InboundMessageContext<DidExchangeResponseMessage>,
    outOfBandRecord: OutOfBandRecord
  ): Promise<ConnectionRecord> {
    this.logger.debug(`Process message ${DidExchangeResponseMessage.type.messageTypeUri} start`, {
      message: messageContext.message,
    })

    const { connection: connectionRecord, message } = messageContext

    if (!connectionRecord) {
      throw new AriesFrameworkError('No connection record in message context.')
    }

    DidExchangeStateMachine.assertProcessMessageState(DidExchangeResponseMessage.type, connectionRecord)

    if (!message.thread?.threadId || message.thread?.threadId !== connectionRecord.threadId) {
      throw new DidExchangeProblemReportError('Invalid or missing thread ID.', {
        problemCode: DidExchangeProblemReportReason.ResponseNotAccepted,
      })
    }

    let didDocument: DidDocument

    const invitationDid = connectionRecord.invitationDid
    const responseDid = message.did

    if (!connectionRecord.did) {
      throw new AriesFrameworkError(`Connection record ${connectionRecord.id} has no 'did'`)
    }

    // We can't create multiple connections with exactly the same dids.
    const existingConnectionRecord = await this.connectionService.findByDids(messageContext.agentContext, {
      ourDid: connectionRecord.did,
      theirDid: responseDid,
    })
    if (existingConnectionRecord) {
      throw new AriesFrameworkError(
        `Connection with ourDid ${connectionRecord.did} and theirDid ${responseDid} already exists.`
      )
    }

    if (invitationDid !== responseDid) {
      // AS the did in the response doesn't match the did in the invitation, we need to verify the did document
      didDocument = await this.extractDidDocument(
        messageContext.agentContext,
        message,
        outOfBandRecord
          .getTags()
          .recipientKeyFingerprints.map((fingerprint) => Key.fromFingerprint(fingerprint).publicKeyBase58)
      )
    } else {
      didDocument = await this.didResolverService.resolveDidDocument(messageContext.agentContext, message.did)
    }

    // If the did in the response is a did:peer:1 did, we need to verify the did document actually encodes to the did as present in the
    // response did
    if (message.did.startsWith('did:peer:1')) {
      const didDocJson = message.didDoc?.getDataAsJson<Record<string, unknown>>()
      if (!didDocJson) throw new AriesFrameworkError('Missing did document in response for did:peer:1 did.')

      const did = didDocumentJsonToNumAlgo1Did(didDocJson)
      if (message.did !== did) {
        throw new DidExchangeProblemReportError(
          `Did in response message does not match did in did document. ${message.did} !== ${did}`,
          {
            problemCode: DidExchangeProblemReportReason.ResponseNotAccepted,
          }
        )
      }
    }

    await this.assertNoOtherDidsWithSameKeys(messageContext.agentContext, didDocument)
    await this.assertNoConnectionsWithDidPair(messageContext.agentContext, {
      ourDid: connectionRecord.did,
      theirDid: didDocument.id,
    })

    // Verify the response did document (either attached or resolved) contains the senderKey that was used to encrypt this message
    const theirDidDocumentSenderKey = didDocument.recipientKeys.find(
      (key) => key.fingerprint === messageContext.senderKey?.fingerprint
    )
    if (!theirDidDocumentSenderKey) {
      throw new DidExchangeProblemReportError(
        `Did document from response message does not contain senderKey ${messageContext.senderKey?.fingerprint}`,
        { problemCode: DidExchangeProblemReportReason.ResponseNotAccepted }
      )
    }

    await this.didCommDocumentService.storeReceivedDidDocument(messageContext.agentContext, didDocument)
    connectionRecord.theirDid = message.did

    await this.updateState(messageContext.agentContext, DidExchangeResponseMessage.type, connectionRecord)
    this.logger.debug(`Process message ${DidExchangeResponseMessage.type.messageTypeUri} end`, connectionRecord)
    return connectionRecord
  }

  public async createComplete(
    agentContext: AgentContext,
    connectionRecord: ConnectionRecord,
    outOfBandRecord: OutOfBandRecord
  ): Promise<DidExchangeCompleteMessage> {
    this.logger.debug(`Create message ${DidExchangeCompleteMessage.type.messageTypeUri} start`, connectionRecord)
    DidExchangeStateMachine.assertCreateMessageState(DidExchangeCompleteMessage.type, connectionRecord)

    const threadId = connectionRecord.threadId
    const parentThreadId = outOfBandRecord.outOfBandInvitation.id

    if (!threadId) {
      throw new AriesFrameworkError(`Connection record ${connectionRecord.id} does not have 'threadId' attribute.`)
    }

    if (!parentThreadId) {
      throw new AriesFrameworkError(
        `Connection record ${connectionRecord.id} does not have 'parentThreadId' attribute.`
      )
    }

    const message = new DidExchangeCompleteMessage({ threadId, parentThreadId })

    await this.updateState(agentContext, DidExchangeCompleteMessage.type, connectionRecord)
    this.logger.debug(`Create message ${DidExchangeCompleteMessage.type.messageTypeUri} end`, {
      connectionRecord,
      message,
    })
    return message
  }

  public async processComplete(
    messageContext: InboundMessageContext<DidExchangeCompleteMessage>,
    outOfBandRecord: OutOfBandRecord
  ): Promise<ConnectionRecord> {
    this.logger.debug(`Process message ${DidExchangeCompleteMessage.type.messageTypeUri} start`, {
      message: messageContext.message,
    })

    const { connection: connectionRecord, message } = messageContext

    if (!connectionRecord) {
      throw new AriesFrameworkError('No connection record in message context.')
    }

    DidExchangeStateMachine.assertProcessMessageState(DidExchangeCompleteMessage.type, connectionRecord)

    if (message.threadId !== connectionRecord.threadId) {
      throw new DidExchangeProblemReportError('Invalid or missing thread ID.', {
        problemCode: DidExchangeProblemReportReason.CompleteRejected,
      })
    }

    if (!message.thread?.parentThreadId || message.thread?.parentThreadId !== outOfBandRecord.getTags().invitationId) {
      throw new DidExchangeProblemReportError('Invalid or missing parent thread ID referencing to the invitation.', {
        problemCode: DidExchangeProblemReportReason.CompleteRejected,
      })
    }

    await this.updateState(messageContext.agentContext, DidExchangeCompleteMessage.type, connectionRecord)
    this.logger.debug(`Process message ${DidExchangeCompleteMessage.type.messageTypeUri} end`, { connectionRecord })
    return connectionRecord
  }

  private async updateState(
    agentContext: AgentContext,
    messageType: ParsedMessageType,
    connectionRecord: ConnectionRecord
  ) {
    this.logger.debug(`Updating state`, { connectionRecord })
    const nextState = DidExchangeStateMachine.nextState(messageType, connectionRecord)
    return this.connectionService.updateState(agentContext, connectionRecord, nextState)
  }

  private async createPeerDidDoc(agentContext: AgentContext, services: ResolvedDidCommService[]) {
    // Create did document without the id property
    const didDocument = createPeerDidDocumentFromServices(services)

    // Register did:peer document. This will generate the id property and save it to a did record
    const result = await this.didRegistrarService.create<PeerDidCreateOptions>(agentContext, {
      method: 'peer',
      didDocument,
      options: {
        numAlgo: PeerDidNumAlgo.GenesisDoc,
      },
    })

    if (result.didState?.state !== 'finished') {
      throw new AriesFrameworkError(`Did document creation failed: ${JSON.stringify(result.didState)}`)
    }

    this.logger.debug(`Did document with did ${result.didState.did} created.`, {
      did: result.didState.did,
      didDocument: result.didState.didDocument,
    })

    return result.didState.didDocument
  }

  private async createSignedAttachment(agentContext: AgentContext, didDoc: DidDocument, verkeys: string[]) {
    const didDocAttach = new Attachment({
      mimeType: 'application/json',
      data: new AttachmentData({
        base64: JsonEncoder.toBase64(didDoc),
      }),
    })

    await Promise.all(
      verkeys.map(async (verkey) => {
        const key = Key.fromPublicKeyBase58(verkey, KeyType.Ed25519)
        const kid = new DidKey(key).did
        const payload = JsonEncoder.toBuffer(didDoc)

        const jws = await this.jwsService.createJws(agentContext, {
          payload,
          verkey,
          header: {
            kid,
          },
        })
        didDocAttach.addJws(jws)
      })
    )

    return didDocAttach
  }

  /**
   * Extracts DID document as is from request or response message attachment and verifies its signature.
   *
   * @param message DID request or DID response message
   * @param invitationKeys array containing keys from connection invitation that could be used for signing of DID document
   * @returns verified DID document content from message attachment
   */
  private async extractDidDocument(
    agentContext: AgentContext,
    message: DidExchangeRequestMessage | DidExchangeResponseMessage,
    invitationKeysBase58: string[] = []
  ): Promise<DidDocument> {
    if (!message.didDoc) {
      const problemCode =
        message instanceof DidExchangeRequestMessage
          ? DidExchangeProblemReportReason.RequestNotAccepted
          : DidExchangeProblemReportReason.ResponseNotAccepted
      throw new DidExchangeProblemReportError('DID Document attachment is missing.', { problemCode })
    }
    const didDocumentAttachment = message.didDoc
    const jws = didDocumentAttachment.data.jws

    if (!jws) {
      const problemCode =
        message instanceof DidExchangeRequestMessage
          ? DidExchangeProblemReportReason.RequestNotAccepted
          : DidExchangeProblemReportReason.ResponseNotAccepted
      throw new DidExchangeProblemReportError('DID Document signature is missing.', { problemCode })
    }

    const json = didDocumentAttachment.getDataAsJson() as Record<string, unknown>
    this.logger.trace('DidDocument JSON', json)

    const payload = JsonEncoder.toBuffer(json)
    const { isValid, signerVerkeys } = await this.jwsService.verifyJws(agentContext, { jws, payload })

    const didDocument = JsonTransformer.fromJSON(json, DidDocument)
    const didDocumentKeysBase58 = didDocument.authentication
      ?.map((authentication) => {
        const verificationMethod =
          typeof authentication === 'string'
            ? didDocument.dereferenceVerificationMethod(authentication)
            : authentication
        const { getKeyFromVerificationMethod } = getKeyDidMappingByVerificationMethod(verificationMethod)
        const key = getKeyFromVerificationMethod(verificationMethod)
        return key.publicKeyBase58
      })
      .concat(invitationKeysBase58)

    this.logger.trace('JWS verification result', { isValid, signerVerkeys, didDocumentKeysBase58 })

    if (!isValid || !signerVerkeys.every((verkey) => didDocumentKeysBase58?.includes(verkey))) {
      const problemCode =
        message instanceof DidExchangeRequestMessage
          ? DidExchangeProblemReportReason.RequestNotAccepted
          : DidExchangeProblemReportReason.ResponseNotAccepted
      throw new DidExchangeProblemReportError('DID Document signature is invalid.', { problemCode })
    }

    return didDocument
  }

  private async assertNoOtherDidsWithSameKeys(agentContext: AgentContext, didDocument: DidDocument): Promise<void> {
    // Find all didRecords that have at least one of the recipient keys
    const didRecords = await this.didRepository.findByQuery(agentContext, {
      $or: didDocument.recipientKeys.map((key) => ({ recipientKeyFingerprints: [key.fingerprint] })),
    })

    // FIXME: should be updated to didRecord.did
    // NOTE: Create set because we can have multiple records for the same did
    const dids = new Set(didRecords.map((didRecord) => didRecord.id))

    if (dids.size > 1 || (dids.size === 1 && !dids.has(didDocument.id))) {
      throw new AriesFrameworkError(
        'The did document uses keys that are also present in other did documents. In DIDComm v1 this is not allowed as it is only possible to extract the key of a received message, not the did.'
      )
    }
  }

  private async assertNoConnectionsWithDidPair(
    agentContext: AgentContext,
    { ourDid, theirDid }: { ourDid: string; theirDid: string }
  ) {
    const existingConnectionRecord = await this.connectionService.findByDids(agentContext, {
      ourDid,
      theirDid,
    })

    if (existingConnectionRecord) {
      throw new AriesFrameworkError(
        `A connection already exists for ourDid ${ourDid} and theirDid ${theirDid}. Only a single connection can exist for a did pair (ourDid, theirDid)`
      )
    }
  }

  private async findInvitationDidForRecipientKey(
    agentContext: AgentContext,
    invitationDids: string[],
    recipientKey: Key
  ): Promise<string | null> {
    const recipientKeyFingerprint = recipientKey.fingerprint

    for (const invitationDid of invitationDids) {
      const didDocument = await this.didResolverService.resolveDidDocument(agentContext, invitationDid)
      const foundRecipientKey = didDocument.recipientKeys.find((key) => key.fingerprint === recipientKeyFingerprint)

      if (foundRecipientKey) return invitationDid
    }

    return null
  }

  private validateDidPeer1Did(expectedDid: string, didDocumentJson?: Record<string, unknown>) {
    if (!didDocumentJson) throw new AriesFrameworkError('Missing did document in for did:peer:1 did.')
    if (didDocumentJson.id !== expectedDid)
      throw new AriesFrameworkError('did in did document does not match did:peer:1 did.')

    const did = didDocumentJsonToNumAlgo1Did(didDocumentJson)
    if (expectedDid !== did) {
      throw new AriesFrameworkError(`calculated did:peer:1 did does not match expected did. ${expectedDid} !== ${did}`)
    }
  }

  private routingToServices(routing: Routing): ResolvedDidCommService[] {
    return routing.endpoints.map((endpoint, index) => ({
      id: `#inline-${index}`,
      serviceEndpoint: endpoint,
      recipientKeys: [routing.recipientKey],
      routingKeys: routing.routingKeys,
    }))
  }
}
