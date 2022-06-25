import type { DependencyManager } from '../plugins'

import { plugin } from '../plugins'

import { DidCommMessageRepository } from './didcomm'
import { StorageUpdateService, StorageVersionRepository } from './migration'

@plugin()
export class StorageUpdatePlugin {
  public static register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(StorageVersionRepository)
    dependencyManager.registerSingleton(StorageUpdateService)
  }
}

@plugin()
export class DidCommMessagePlugin {
  public static register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(DidCommMessageRepository)
  }
}
