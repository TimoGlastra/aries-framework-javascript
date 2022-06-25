import type { DependencyManager, Plugin } from '../plugins'

import { DidCommMessageRepository } from './didcomm'
import { StorageUpdateService, StorageVersionRepository } from './migration'

export const storageUpdatePlugin: Plugin = {
  register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(StorageVersionRepository)
    dependencyManager.registerSingleton(StorageUpdateService)
  },
}

export const didCommMessagePlugin: Plugin = {
  register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(DidCommMessageRepository)
  },
}
