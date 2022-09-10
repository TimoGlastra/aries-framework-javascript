import type { AgentConfig } from '../../agent/AgentConfig'
import type { AgentMessage } from '../../agent/AgentMessage'
import type { EventEmitter } from '../../agent/EventEmitter'
import type { AgentContext } from '../../agent/context/AgentContext'
import type { InboundMessageContext } from '../../agent/models/InboundMessageContext'
import type { Logger } from '../../logger'
import type { DidCommMessageRepository, DidCommMessageRole } from '../../storage'
import type { Wallet } from '../../wallet/Wallet'
import type { ConnectionService } from '../connections/services'
import type { ProofStateChangedEvent } from './ProofEvents'
import type { AcceptPresentationOptions } from './ProofsApiOptions'
import type { ProofFormat } from './formats/ProofFormat'
import type {
  CreateProposalOptions,
  CreateRequestOptions,
  DeleteProofOptions,
  AcceptProposalOptions,
  AcceptRequestOptions,
  CreateProblemReportOptions,
  ProofProtocolMsgReturnType,
} from './models/ProofServiceOptions'
import type { ProofState } from './models/ProofState'
import type { ProofRecord, ProofRepository } from './repository'

import { JsonTransformer } from '../../utils/JsonTransformer'

import { ProofEventTypes } from './ProofEvents'

export abstract class ProofService<PFs extends ProofFormat[] = ProofFormat[]> {
  protected proofRepository: ProofRepository
  protected didCommMessageRepository: DidCommMessageRepository
  protected eventEmitter: EventEmitter
  protected connectionService: ConnectionService
  protected wallet: Wallet
  protected logger: Logger

  public constructor(
    agentConfig: AgentConfig,
    proofRepository: ProofRepository,
    connectionService: ConnectionService,
    didCommMessageRepository: DidCommMessageRepository,
    wallet: Wallet,
    eventEmitter: EventEmitter
  ) {
    this.proofRepository = proofRepository
    this.connectionService = connectionService
    this.didCommMessageRepository = didCommMessageRepository
    this.eventEmitter = eventEmitter
    this.wallet = wallet
    this.logger = agentConfig.logger
  }

  abstract readonly version: string

  public async generateProofRequestNonce() {
    return await this.wallet.generateNonce()
  }

  // methods for proposal
  abstract createProposal(
    agentContext: AgentContext,
    options: CreateProposalOptions<PFs>
  ): Promise<ProofProtocolMsgReturnType>
  abstract processProposal(messageContext: InboundMessageContext<AgentMessage>): Promise<ProofRecord>
  abstract acceptProposal(
    agentContext: AgentContext,
    options: AcceptProposalOptions<PFs>
  ): Promise<ProofProtocolMsgReturnType>

  // methods for request
  abstract createRequest(
    agentContext: AgentContext,
    options: CreateRequestOptions<PFs>
  ): Promise<ProofProtocolMsgReturnType>
  abstract processRequest(messageContext: InboundMessageContext<AgentMessage>): Promise<ProofRecord>
  abstract acceptRequest(
    agentContext: AgentContext,
    options: AcceptRequestOptions<PFs>
  ): Promise<ProofProtocolMsgReturnType>

  // methods for presentation
  abstract processPresentation(messageContext: InboundMessageContext<AgentMessage>): Promise<ProofRecord>
  abstract acceptPresentation(
    agentContext: AgentContext,
    options: AcceptPresentationOptions
  ): Promise<ProofProtocolMsgReturnType>

  // methods for ack
  abstract processAck(messageContext: InboundMessageContext<AgentMessage>): Promise<ProofRecord>

  // T-TODO: handle processProblemReport here? (no specific implementation per service)
  // methods for problem-report
  abstract createProblemReport(
    agentContext: AgentContext,
    options: CreateProblemReportOptions
  ): Promise<ProofProtocolMsgReturnType>
  abstract processProblemReport(messageContext: InboundMessageContext<AgentMessage>): Promise<ProofRecord>

  // methods for getting credentials for proof request
  public abstract getRequestedCredentialsForProofRequest(
    agentContext: AgentContext,
    options: GetRequestedCredentialsForProofRequestOptions
  ): Promise<FormatRetrievedCredentialOptions<PFs>>
  public abstract autoSelectCredentialsForProofRequest(
    options: FormatRetrievedCredentialOptions<PFs>
  ): Promise<FormatRequestedCredentialReturn<PFs>>

  // T-TODO what ot do with this?
  public abstract shouldAutoRespondToProposal(agentContext: AgentContext, proofRecord: ProofRecord): Promise<boolean>
  public abstract shouldAutoRespondToRequest(agentContext: AgentContext, proofRecord: ProofRecord): Promise<boolean>
  public abstract shouldAutoRespondToPresentation(
    agentContext: AgentContext,
    proofRecord: ProofRecord
  ): Promise<boolean>

  public abstract findProposalMessage(agentContext: AgentContext, proofRecordId: string): Promise<AgentMessage | null>
  public abstract findRequestMessage(agentContext: AgentContext, proofRecordId: string): Promise<AgentMessage | null>
  public abstract findPresentationMessage(
    agentContext: AgentContext,
    proofRecordId: string
  ): Promise<AgentMessage | null>
  // T-TODO: getFormatData
  // abstract getFormatData(agentContext: AgentContext, proofRecordId: string): Promise<GetFormatDataReturn<CFs>>

  /**
   * Update the record to a new state and emit an state changed event. Also updates the record
   * in storage.
   *
   * @param proofRecord The proof record to update the state for
   * @param newState The state to update to
   *
   */
  public async updateState(agentContext: AgentContext, proofRecord: ProofRecord, newState: ProofState) {
    const previousState = proofRecord.state
    proofRecord.state = newState
    await this.proofRepository.update(agentContext, proofRecord)

    this.emitStateChangedEvent(agentContext, proofRecord, previousState)
  }

  public emitStateChangedEvent(agentContext: AgentContext, proofRecord: ProofRecord, previousState: ProofState | null) {
    const clonedProof = JsonTransformer.clone(proofRecord)

    this.eventEmitter.emit<ProofStateChangedEvent>(agentContext, {
      type: ProofEventTypes.ProofStateChanged,
      payload: {
        proofRecord: clonedProof,
        previousState: previousState,
      },
    })
  }

  public update(agentContext: AgentContext, proofRecord: ProofRecord) {
    return this.proofRepository.update(agentContext, proofRecord)
  }

  public async saveOrUpdatePresentationMessage(
    agentContext: AgentContext,
    options: {
      proofRecord: ProofRecord
      message: AgentMessage
      role: DidCommMessageRole
    }
  ): Promise<void> {
    await this.didCommMessageRepository.saveOrUpdateAgentMessage(agentContext, {
      associatedRecordId: options.proofRecord.id,
      agentMessage: options.message,
      role: options.role,
    })
  }

  public async delete(
    agentContext: AgentContext,
    proofRecord: ProofRecord,
    options?: DeleteProofOptions
  ): Promise<void> {
    await this.proofRepository.delete(agentContext, proofRecord)

    const deleteAssociatedDidCommMessages = options?.deleteAssociatedDidCommMessages ?? true

    if (deleteAssociatedDidCommMessages) {
      const didCommMessages = await this.didCommMessageRepository.findByQuery(agentContext, {
        associatedRecordId: proofRecord.id,
      })
      for (const didCommMessage of didCommMessages) {
        await this.didCommMessageRepository.delete(agentContext, didCommMessage)
      }
    }
  }
}
