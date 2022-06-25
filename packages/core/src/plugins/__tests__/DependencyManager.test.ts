import { container as rootContainer, Lifecycle } from 'tsyringe'

import { DependencyManager } from '../DependencyManager'
import { modulePlugin, plugin } from '../Plugin'

class Instance {
  public random = Math.random()
}
const instance = new Instance()

const container = rootContainer.createChildContainer()
const dependencyManager = new DependencyManager(container)

describe('DependencyManager', () => {
  afterEach(() => {
    jest.resetAllMocks()
    container.reset()
  })

  describe('registerPlugins', () => {
    it('calls the register method for all plugins', () => {
      @plugin()
      class Plugin1 {
        public static register = jest.fn()
      }

      @plugin()
      class Plugin2 {
        public static register = jest.fn()
      }

      dependencyManager.registerPlugins([Plugin1, Plugin2])
      expect(Plugin1.register).toHaveBeenCalledTimes(1)
      expect(Plugin1.register).toHaveBeenLastCalledWith(dependencyManager)

      expect(Plugin2.register).toHaveBeenCalledTimes(1)
      expect(Plugin2.register).toHaveBeenLastCalledWith(dependencyManager)
    })
  })

  describe('registerModulePlugins', () => {
    it('calls the register method for all module plugins', () => {
      @modulePlugin()
      class ModulePlugin {
        public static register = jest.fn()
      }

      @modulePlugin()
      class ModulePlugin2 {
        public static register = jest.fn()
      }

      const registerSpy = jest.spyOn(container, 'register')

      dependencyManager.registerModulePlugins([ModulePlugin, ModulePlugin2])
      expect(ModulePlugin.register).toHaveBeenCalledTimes(1)
      expect(ModulePlugin.register).toHaveBeenLastCalledWith(dependencyManager)

      expect(ModulePlugin2.register).toHaveBeenCalledTimes(1)
      expect(ModulePlugin2.register).toHaveBeenLastCalledWith(dependencyManager)

      expect(registerSpy).toHaveBeenCalledWith(ModulePlugin, ModulePlugin, { lifecycle: Lifecycle.ContainerScoped })
      expect(registerSpy).toHaveBeenCalledWith(ModulePlugin2, ModulePlugin2, { lifecycle: Lifecycle.ContainerScoped })
    })
  })

  describe('registerSingleton', () => {
    it('calls registerSingleton on the container', () => {
      class Singleton {}

      const registerSingletonSpy = jest.spyOn(container, 'registerSingleton')
      dependencyManager.registerSingleton(Singleton)

      expect(registerSingletonSpy).toHaveBeenLastCalledWith(Singleton, undefined)

      dependencyManager.registerSingleton(Singleton, 'Singleton')

      expect(registerSingletonSpy).toHaveBeenLastCalledWith(Singleton, 'Singleton')
    })
  })

  describe('resolve', () => {
    it('calls resolve on the container', () => {
      // FIXME: somehow this doesn't work if we don't create a child container
      const child = container.createChildContainer()
      const dependencyManager = new DependencyManager(child)
      child.registerInstance(Instance, instance)

      const resolveSpy = jest.spyOn(child, 'resolve')
      expect(dependencyManager.resolve(Instance)).toBe(instance)

      expect(resolveSpy).toHaveBeenCalledWith(Instance)
    })
  })

  describe('isRegistered', () => {
    it('calls isRegistered on the container', () => {
      class Singleton {}

      const isRegisteredSpy = jest.spyOn(container, 'isRegistered')

      expect(dependencyManager.isRegistered(Singleton)).toBe(false)

      expect(isRegisteredSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('registerInstance', () => {
    it('calls registerInstance on the container', () => {
      class Instance {}
      const instance = new Instance()

      const registerInstanceSpy = jest.spyOn(container, 'registerInstance')

      dependencyManager.registerInstance(Instance, instance)

      expect(registerInstanceSpy).toHaveBeenCalledWith(Instance, instance)
    })
  })
})
