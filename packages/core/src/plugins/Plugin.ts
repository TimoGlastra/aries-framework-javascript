import type { DependencyManager } from './DependencyManager'

export interface Plugin {
  register(dependencyManager: DependencyManager): void
}

/**
 * A module plugin must have a constructor, which means it will be registered on it's own,
 * a normal plugin will only register dependencies, and doesn't expose a public API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ModulePlugin<Module = any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): Module
  register(dependencyManager: DependencyManager): void
}
