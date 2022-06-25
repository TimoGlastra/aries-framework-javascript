import type { DependencyManager } from '../plugins'

import { plugin } from '../plugins'

import { JwsService } from './JwsService'

@plugin()
export class CryptoPlugin {
  public static register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(JwsService)
  }
}
