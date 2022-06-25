import type { Constructor } from '../utils/mixins'
import type { ModulePlugin, Plugin } from './Plugin'
import type { DependencyContainer } from 'tsyringe'

import { InjectionToken, Lifecycle } from 'tsyringe'

export { InjectionToken }

export class DependencyManager {
  public container: DependencyContainer

  public constructor(container: DependencyContainer) {
    this.container = container
  }

  public registerModulePlugins(modules: ModulePlugin | ModulePlugin[]) {
    const modulesArray = Array.isArray(modules) ? modules : [modules]

    modulesArray.forEach((module) => {
      // Register Module class to be instantiated per container
      this.registerContextScoped(module)

      // Register all dependencies of this module
      module.register(this)
    })
  }

  public registerPlugins(plugins: Plugin | Plugin[]) {
    const pluginsArray = Array.isArray(plugins) ? plugins : [plugins]

    pluginsArray.forEach((plugin) => plugin.register(this))
  }

  public registerSingleton<T>(from: InjectionToken<T>, to: InjectionToken<T>): void
  public registerSingleton<T>(token: Constructor<T>): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerSingleton<T = any>(fromOrToken: InjectionToken<T> | Constructor<T>, to?: any) {
    this.container.registerSingleton(fromOrToken, to)
  }

  public resolve<T>(token: InjectionToken<T>): T {
    return this.container.resolve(token)
  }

  public registerInstance<T>(token: InjectionToken<T>, instance: T) {
    this.container.registerInstance(token, instance)
  }

  public isRegistered<T>(token: InjectionToken<T>): boolean {
    return this.container.isRegistered(token)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerContextScoped<T = any>(token: Constructor<T>): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerContextScoped<T = any>(token: InjectionToken<T>, provider: Constructor<T>): void

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerContextScoped(token: any, provider?: any) {
    if (provider) this.container.register(token, provider, { lifecycle: Lifecycle.ContainerScoped })
    else this.container.register(token, token, { lifecycle: Lifecycle.ContainerScoped })
  }
}
