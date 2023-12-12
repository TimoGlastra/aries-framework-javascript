import type { AgentContext } from '../agent'
import type { FeatureRegistry } from '../agent/FeatureRegistry'
import type { Update } from '../storage/migration/updates'
import type { Constructor } from '../utils/mixins'
import type { DependencyManager } from './DependencyManager'

export interface Module {
  api?: Constructor<unknown>
  register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void
  initialize?(agentContext: AgentContext): Promise<void>

  /**
   * List of updates that should be executed when the framework version is updated.
   */
  updates?: Update[]
}

export interface ApiModule extends Module {
  api: Constructor<unknown>
}
