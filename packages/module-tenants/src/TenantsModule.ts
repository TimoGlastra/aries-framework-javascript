import type { CreateTenantOptions, GetTenantAgentOptions } from './TenantModuleOptions'
import type { DependencyManager } from '@aries-framework/core'

import { modulePlugin, AgentContext, inject, InjectionSymbols, AgentContextProvider } from '@aries-framework/core'

import { TenantAgent } from './TenantAgent'
import { TenantAgentContextProvider } from './TenantAgentContextProvider'
import { TenantRepository, TenantRoutingRepository } from './repository'
import { TenantService } from './services'

@modulePlugin()
export class TenantsModule {
  private agentContext: AgentContext
  private tenantService: TenantService
  private agentContextProvider: AgentContextProvider

  public constructor(
    tenantService: TenantService,
    @inject(InjectionSymbols.AgentContext) agentContext: AgentContext,
    @inject(InjectionSymbols.AgentContextProvider) agentContextProvider: AgentContextProvider
  ) {
    this.tenantService = tenantService
    this.agentContext = agentContext
    this.agentContextProvider = agentContextProvider
  }

  public async getTenantAgent({ tenantId }: GetTenantAgentOptions): Promise<TenantAgent> {
    const tenantContext = await this.agentContextProvider.getAgentContextForContextCorrelationId(tenantId)

    const tenantAgent = new TenantAgent(tenantContext)
    await tenantAgent.initialize()

    return tenantAgent
  }

  public async createTenant(options: CreateTenantOptions) {
    const tenantRecord = await this.tenantService.createTenant(this.agentContext, options.config)

    // This initializes the tenant agent, creates the wallet etc...
    const tenantAgent = await this.getTenantAgent({ tenantId: tenantRecord.id })
    await tenantAgent.shutdown()

    return tenantRecord
  }

  public async getTenantById(tenantId: string) {
    return this.tenantService.getTenantById(this.agentContext, tenantId)
  }

  public async deleteTenantById(tenantId: string) {
    return this.tenantService.deleteTenantById(this.agentContext, tenantId)
  }

  /**
   * Registers the dependencies of the tenants module on the dependency manager.
   */
  public static register(dependencyManager: DependencyManager) {
    // Services
    dependencyManager.registerSingleton(TenantService)

    // Repositories
    dependencyManager.registerSingleton(TenantRepository)
    dependencyManager.registerSingleton(TenantRoutingRepository)

    dependencyManager.registerSingleton(InjectionSymbols.AgentContextProvider, TenantAgentContextProvider)
  }
}
