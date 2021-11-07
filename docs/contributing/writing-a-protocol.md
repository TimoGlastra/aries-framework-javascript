# Writing a Protocol

Writing a protocol .

- Message classes - A class representation of a DIDComm message
- Message handlers - Handler that will be called when a message with a certain `@type` is received
- Record -
- Repository -
- Service
- Module

When writing a proposal it is often time the easiest to start with the boilerplate code that is needed for each new protocol.

## Structure

Protocols are placed in the modules directory. A module can contain multiple protocols that cover the same topic. E.g. the `routing` module contains the `messagepickup`, the `routing` and the `coordinate-mediation` protocols.

```
<module-name>s/
    __tests__/
    handlers/
        <MessageName>Handler.ts
    messages/
        <MessageName>Message.ts
    models/
        <ModelName>.ts
    repository/
        <RecordName>Record.ts
        <RecordName>Repository.ts
    services/
        <ServiceName>Service.ts
    <ModuleName>Events.ts
    <ModuleName>sModule.ts
    index.ts
```

## Message classes

Message classes map the JSON structure of a DIDComm message to a class instance. Below is a simplified version of the `TrustPingMessage.ts` message class.

Decorator methods from [Class Transformer](https://github.com/typestack/class-transformer) and [Class Validator](https://github.com/typestack/class-validator) are used for transformation and validation utilities.

All messages that will be used for DIDComm should extend from the base `AgentMessage` class. This provides a foundation with often need utilities, the `@id` and `@type` properties, and a handful of commonly used decorators.

It is oftentimes useful to add a link to the exact message in the protocol using the `@see` decorator in the JSDocs.

Each message should get it's own class, placed in the `messages/` directory of the module. See the [`messages` directory](../../packages/core/src/modules/connections/messages) of the connections module for an example. Make sure create an `index.ts` file in the messages directory to export all messages.

```ts
// class-transformer and class-validator are used for validation/transformation
import { Expose } from 'class-transformer'
import { Equals, IsString, IsBoolean, IsOptional } from 'class-validator'

// Agent class provides the base class for all message classes
import { AgentMessage } from '../../../agent/AgentMessage'

// Each message should define an interface with options
export interface TrustPingMessageOptions {
  // every message should allow to specify the id property, but if not provided a uuid should be used as the id.
  id?: string

  // additional properties can be added as needed
  comment?: string
  responseRequested?: boolean
}

/**
 * Message to initiate trust ping interaction
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0048-trust-ping/README.md#messages
 */
export class TrustPingMessage extends AgentMessage {
  /**
   * Create new TrustPingMessage instance.
   *    - `responseRequested` will be true if not passed
   */
  public constructor(options: TrustPingMessageOptions) {
    // always call the super
    super()

    // due to how class-transformer works we to add an if statement that checks if options is provided
    if (options) {
      // if no id is passed, use the generateId method to automatically generate an id
      this.id = options.id ?? this.generateId()
      this.comment = options.comment
      this.responseRequested = options.responseRequested !== undefined ? options.responseRequested : true
    }
  }

  // @type property should be specified as type, adding the message type inline
  // To be able for the framework to automatically transform received messages into
  // the message class the
  @Equals(TrustPingMessage.type)
  public readonly type = TrustPingMessage.type
  public static readonly type = 'https://didcomm.org/trust_ping/1.0/ping'

  // use class-validator decorators to add validation to properties. Messages are automatically verified before
  // receiving or sending messages, to make sure messages are valid.
  @IsString()
  @IsOptional()
  public comment?: string

  // use the @Expose decorator to map non-camelCase properties to camelCase. We want to provide a consistent
  // experience to users of the framework.
  @IsBoolean()
  @Expose({ name: 'response_requested' })
  public responseRequested = true
}
```

### Message handlers

A message handler is called when a DIDcomm message of a specific type is received in the agent.

The `Dispatcher` has a registry of all registered handlers, and can automatically detect the supported message types using the `supportedMessages` array. This is a list of message classes, just like the message class created in the [Message classes](#message-classes) section. The convention in AFJ is to create a separate handler class per message type, but it is possible to specify multiple message types. This can be useful when writing a simple plugin outside of AFJ and you don't want to deal with the boilerplate code of writing multiple handlers.

Each handler must contain at least one method `handle()`, which takes a single argument `messageContext`.

All handler should be placed in the `handlers/` directory of the module. See the [`handlers` directory](../../packages/core/src/modules/connections/handlers) of the connections module for an example. Make sure create an `index.ts` file in the handlers directory to export all handlers.

```ts
import type { Handler, HandlerInboundMessage } from '../../../agent/Handler'
import type { TrustPingService } from '../services/TrustPingService'

import { createOutboundMessage } from '../../../agent/helpers'
import { TrustPingMessage } from '../messages'

// A handler should implement the `Handler` class
export class TrustPingMessageHandler implements Handler {
  private trustPingService: TrustPingService

  // The `supportedMessages` array should list all message types this handler can process
  public supportedMessages = [TrustPingMessage]

  // Dependant services can be specified in the constructor
  public constructor(trustPingService: TrustPingService) {
    this.trustPingService = trustPingService
  }

  // Each handler MUST implement the handle method
  // Use `HandlerInboundMessage<HandlerClassName> to get a typed message context
  public async handle(messageContext: HandlerInboundMessage<TrustPingMessageHandler>) {
    // If the protocol requires a ready connection, you can use the `assertReadyConnection` method.
    const connection = messageContext.assertReadyConnection()

    // Call the service to process the message
    const pingResponse = this.trustPingService.processPing(messageContext)

    // You can return a message from the handle method that should be sent as a response.
    // This is a convenience for request-response type protocols
    if (pingResponse) {
      return createOutboundMessage(connection, pingResponse)
    }
  }
}
```
