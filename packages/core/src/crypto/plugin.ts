import type { DependencyManager, Plugin } from '../plugins'

import { JwsService } from './JwsService'

export const cryptoPlugin: Plugin = {
  register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(JwsService)
  },
}
