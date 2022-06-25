import type { DependencyManager } from '../plugins'

import { plugin } from '../plugins'

import { CacheRepository } from './CacheRepository'

@plugin()
export class CachePlugin {
  public static register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(CacheRepository)
  }
}
