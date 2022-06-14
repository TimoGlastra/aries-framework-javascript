import type { BasicMessageTags } from './repository/BasicMessageRecord'

import { inject, Lifecycle, scoped } from 'tsyringe'

import { AgentContext } from '../../agent'
import { Dispatcher } from '../../agent/Dispatcher'
import { MessageSender } from '../../agent/MessageSender'
import { createOutboundMessage } from '../../agent/helpers'
import { InjectionSymbols } from '../../constants'
import { ConnectionService } from '../connections'

import { BasicMessageHandler } from './handlers'
import { BasicMessageService } from './services'

@scoped(Lifecycle.ContainerScoped)
export class BasicMessagesModule {
  private basicMessageService: BasicMessageService
  private messageSender: MessageSender
  private connectionService: ConnectionService
  private agentContext: AgentContext

  public constructor(
    dispatcher: Dispatcher,
    basicMessageService: BasicMessageService,
    messageSender: MessageSender,
    connectionService: ConnectionService,
    @inject(InjectionSymbols.AgentContext) agentContext: AgentContext
  ) {
    this.basicMessageService = basicMessageService
    this.messageSender = messageSender
    this.connectionService = connectionService
    this.agentContext = agentContext
    this.registerHandlers(dispatcher)
  }

  public async sendMessage(connectionId: string, message: string) {
    const connection = await this.connectionService.getById(this.agentContext, connectionId)

    const basicMessage = await this.basicMessageService.createMessage(this.agentContext, message, connection)
    const outboundMessage = createOutboundMessage(connection, basicMessage)
    await this.messageSender.sendMessage(this.agentContext, outboundMessage)
  }

  public async findAllByQuery(query: Partial<BasicMessageTags>) {
    return this.basicMessageService.findAllByQuery(this.agentContext, query)
  }

  private registerHandlers(dispatcher: Dispatcher) {
    dispatcher.registerHandler(new BasicMessageHandler(this.basicMessageService))
  }
}
