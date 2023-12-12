import type { AgentContext } from '../../../agent'
import type { AgentMessage } from '../../../agent/AgentMessage'
import type { FeatureRegistry } from '../../../agent/FeatureRegistry'
import type { DependencyManager } from '../../../plugins'
import type { PickupMessagesProtocolOptions, PickupMessagesProtocolReturnType } from './MessagePickupProtocolOptions'

export interface MessagePickupProtocol {
  readonly version: string

  pickupMessages(
    agentContext: AgentContext,
    options: PickupMessagesProtocolOptions
  ): Promise<PickupMessagesProtocolReturnType<AgentMessage>>

  register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void
}
