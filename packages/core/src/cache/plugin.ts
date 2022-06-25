import type { Plugin, DependencyManager } from '../plugins'

import { CacheRepository } from './CacheRepository'

export const cachePlugin: Plugin = {
  register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(CacheRepository)
  },
}
