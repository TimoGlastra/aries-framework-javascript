import type { AgentContextProvider, Wallet, RoutingCreatedEvent, EncryptedMessage } from '@aries-framework/core'

import {
  AriesFrameworkError,
  injectable,
  AgentContext,
  EventEmitter,
  inject,
  Logger,
  RoutingEventTypes,
  DefaultAgentContext,
  InjectionSymbols,
  Key,
} from '@aries-framework/core'

// FIXME: export needed types from core
import { KeyType } from '../../core/src/crypto'
import { isValidJweStructure, JsonEncoder } from '../../core/src/utils'
import { isJsonObject } from '../../core/src/utils/type'

import { TenantService } from './services'

@injectable()
export class TenantAgentContextProvider implements AgentContextProvider {
  private tenantService: TenantService
  private rootAgentContext: AgentContext
  private eventEmitter: EventEmitter
  private logger: Logger

  // FIXME: temporary
  private tenantAgentContextMapping: {
    [tenantId: string]: AgentContext
  } = {}

  public constructor(
    tenantService: TenantService,
    @inject(InjectionSymbols.AgentContext) rootAgentContext: AgentContext,
    eventEmitter: EventEmitter,
    @inject(InjectionSymbols.Logger) logger: Logger
  ) {
    this.tenantService = tenantService
    this.rootAgentContext = rootAgentContext
    this.eventEmitter = eventEmitter
    this.logger = logger

    // Start listener for newly created routing keys, so we can register a mapping for each new key for the tenant
    this.listenForRoutingKeyCreatedEvents()
  }

  // FIXME: document this doesn't initialize the wallet yet
  public async getAgentContextForContextCorrelationId(tenantId: string) {
    // FIXME: temporary
    if (this.tenantAgentContextMapping[tenantId]) {
      return this.tenantAgentContextMapping[tenantId]
    }

    const tenantRecord = await this.tenantService.getTenantById(this.rootAgentContext, tenantId)

    const tenantDependencyManager = this.rootAgentContext.dependencyManager.createChild()
    const wallet = tenantDependencyManager.resolve<Wallet>(InjectionSymbols.Wallet)
    const tenantConfig = this.rootAgentContext.config.extend(tenantRecord.config)

    this.logger.debug(`Created tenant agent context for tenant '${tenantId}'`)

    const agentContext = new DefaultAgentContext({
      wallet,
      config: tenantConfig,
      contextCorrelationId: tenantRecord.id,
      dependencyManager: tenantDependencyManager,
    })

    tenantDependencyManager.registerInstance(InjectionSymbols.AgentContext, agentContext)

    // FIXME: this can lead to race conditions if we receive two messages for the same tenant
    this.tenantAgentContextMapping[tenantId] = agentContext

    return agentContext
  }

  public async getContextForInboundMessage(inboundMessage: unknown, options?: { contextCorrelationId?: string }) {
    this.logger.debug('Getting context for inbound message in tenant agent context provider', {
      contextCorrelationId: options?.contextCorrelationId,
    })

    let tenantId = options?.contextCorrelationId

    if (!tenantId && isValidJweStructure(inboundMessage)) {
      this.logger.trace("Inbound message is a JWE, extracting tenant id from JWE's protected header")
      const recipientKeys = this.getRecipientKeysFromEncryptedMessage(inboundMessage)

      this.logger.trace(`Found ${recipientKeys.length} recipient keys in JWE's protected header`)

      // FIXME: we should not take the first index
      const tenantRoutingRecord = await this.tenantService.findTenantRoutingRecordByRecipientKey(
        this.rootAgentContext,
        recipientKeys[0]
      )

      if (tenantRoutingRecord) {
        this.logger.debug(`Found tenant routing record for recipient key ${recipientKeys[0].fingerprint}`, {
          tenantId: tenantRoutingRecord.tenantId,
        })
        tenantId = tenantRoutingRecord.tenantId
      }
    }

    // TODO: proper error handling
    if (!tenantId) {
      this.logger.error("Couldn't find tenant id for inbound message, can't create context", {
        inboundMessage,
      })
      throw new AriesFrameworkError('Error getting tenant id for inbound message')
    }

    const agentContext = await this.getAgentContextForContextCorrelationId(tenantId)

    if (!agentContext.wallet.isInitialized) {
      // We're missing a few things from the wallet module here...
      // Options:
      //  1. inject wallet module and use that (should work if we bind agent context)
      //  2. recreate it here
      //  3. add a new service that handles this (extract open/create/ etc.. from wallet and module)
      // FIXME: we now assume the wallet already exists (which should be the case)
      // FIXME: remove non-null assertion
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await agentContext.wallet.open(agentContext.config.walletConfig!)
    }

    return agentContext
  }

  // TODO: maybe this is a nice util to have in core?
  private getRecipientKeysFromEncryptedMessage(jwe: EncryptedMessage): Key[] {
    const jweProtected = JsonEncoder.fromBase64(jwe.protected)
    if (!Array.isArray(jweProtected.recipients)) return []

    const recipientKeys: Key[] = []

    for (const recipient of jweProtected.recipients) {
      // Check if recipient.header.kid is a string
      if (isJsonObject(recipient) && isJsonObject(recipient.header) && typeof recipient.header.kid === 'string') {
        // This won't work with other key types, we should detect what the encoding is of kid, and based on that
        // determine how we extract the key from the message
        const key = Key.fromPublicKeyBase58(recipient.header.kid, KeyType.Ed25519)
        recipientKeys.push(key)
      }
    }

    return recipientKeys
  }

  private async registerRecipientKeyForTenant(tenantId: string, recipientKey: Key) {
    this.logger.debug(`Registering recipient key ${recipientKey.fingerprint} for tenant ${tenantId}`)
    const tenantRecord = await this.tenantService.getTenantById(this.rootAgentContext, tenantId)
    await this.tenantService.addTenantRoutingRecord(this.rootAgentContext, tenantRecord.id, recipientKey)
  }

  private listenForRoutingKeyCreatedEvents() {
    this.logger.debug('Listening for routing key created events in tenant agent context provider')
    this.eventEmitter.on<RoutingCreatedEvent>(RoutingEventTypes.RoutingCreatedEvent, async (event) => {
      const contextCorrelationId = event.metadata.contextCorrelationId
      const recipientKey = event.payload.routing.recipientKey

      // TODO: find a good way to filter out base wallet
      if (contextCorrelationId === 'default') return

      this.logger.debug(
        `Received routing key created event for tenant ${contextCorrelationId}, registering recipient key ${recipientKey.fingerprint} in base wallet`
      )
      await this.registerRecipientKeyForTenant(contextCorrelationId, recipientKey)
    })
  }
}
