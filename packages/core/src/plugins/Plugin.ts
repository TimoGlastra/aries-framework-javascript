import type { DependencyManager } from './DependencyManager'

import { injectable } from 'tsyringe'

export interface Plugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): any
  register(dependencyManager: DependencyManager): void
}

// For now ModulePlugin interface is the same as the Plugin interface.
export type ModulePlugin = Plugin

/**
 * Decorator that marks the class as a plugin. Will enforce the required interface for a plugin (with static methods)
 * on the class declaration. A plugin doesn't have a public api by default, if you need this, use the `@modulePlugin` decorator.
 */
export function plugin() {
  return <U extends Plugin>(constructor: U) => constructor
}

/**
 * Decorator that marks the class as a module plugin. Will enforce the required interface for a plugin (with static methods)
 * on the class declaration. A module plugin is a plugin with public api, if you don't need this, use the `@plugin` decorator.
 */
export function modulePlugin() {
  return <U extends ModulePlugin>(constructor: U) => injectable()(constructor)
}
