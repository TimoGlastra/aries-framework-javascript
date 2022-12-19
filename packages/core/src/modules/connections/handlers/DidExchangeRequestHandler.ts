import type { MessageHandler, MessageHandlerInboundMessage } from '../../../agent/MessageHandler'
import type { OutOfBandService } from '../../oob/OutOfBandService'
import type { ConnectionsModuleConfig } from '../ConnectionsModuleConfig'
import type { DidExchangeProtocol } from '../DidExchangeProtocol'

import { OutboundMessageContext } from '../../../agent/models'
import { AriesFrameworkError } from '../../../error/AriesFrameworkError'
import { OutOfBandState } from '../../oob/domain/OutOfBandState'
import { DidExchangeProblemReportError, DidExchangeProblemReportReason } from '../errors'
import { DidExchangeRequestMessage } from '../messages'

export class DidExchangeRequestHandler implements MessageHandler {
  private didExchangeProtocol: DidExchangeProtocol
  private outOfBandService: OutOfBandService
  private connectionsModuleConfig: ConnectionsModuleConfig
  public supportedMessages = [DidExchangeRequestMessage]

  public constructor(
    didExchangeProtocol: DidExchangeProtocol,
    outOfBandService: OutOfBandService,
    connectionsModuleConfig: ConnectionsModuleConfig
  ) {
    this.didExchangeProtocol = didExchangeProtocol
    this.outOfBandService = outOfBandService
    this.connectionsModuleConfig = connectionsModuleConfig
  }

  public async handle(messageContext: MessageHandlerInboundMessage<DidExchangeRequestHandler>) {
    const { recipientKey, senderKey, message, connection } = messageContext

    if (!recipientKey || !senderKey) {
      throw new AriesFrameworkError('Unable to process connection request without senderKey or recipientKey')
    }

    if (!message.thread?.parentThreadId) {
      throw new AriesFrameworkError(`Message does not contain 'pthid' attribute`)
    }
    const outOfBandRecord = await this.outOfBandService.findByInvitationId(
      messageContext.agentContext,
      message.thread.parentThreadId
    )

    if (!outOfBandRecord) {
      throw new AriesFrameworkError(`OutOfBand record for message ID ${message.thread?.parentThreadId} not found!`)
    }

    if (connection) {
      throw new DidExchangeProblemReportError(
        `Connection for senderKey ${senderKey.fingerprint} and recipientKey ${recipientKey.fingerprint} already exists.`,
        {
          problemCode: DidExchangeProblemReportReason.RequestNotAccepted,
        }
      )
    }

    // TODO Shouldn't we check also if the keys match the keys from oob invitation services?
    if (outOfBandRecord.state === OutOfBandState.Done) {
      throw new AriesFrameworkError(
        'Out-of-band record has been already processed and it does not accept any new requests'
      )
    }

    const connectionRecord = await this.didExchangeProtocol.processRequest(messageContext, outOfBandRecord)

    if (connectionRecord.autoAcceptConnection ?? this.connectionsModuleConfig.autoAcceptConnections) {
      const message = await this.didExchangeProtocol.createResponse(
        messageContext.agentContext,
        connectionRecord,
        outOfBandRecord
      )
      return new OutboundMessageContext(message, {
        agentContext: messageContext.agentContext,
        connection: connectionRecord,
        outOfBand: outOfBandRecord,
      })
    }
  }
}
