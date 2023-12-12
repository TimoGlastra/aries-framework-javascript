import type { ModulesMap } from '@aries-framework/core'
import type { TenantAgent } from './TenantAgent'
import type { TenantConfig } from './models/TenantConfig'

export interface GetTenantAgentOptions {
  tenantId: string
}

export type WithTenantAgentCallback<AgentModules extends ModulesMap> = (
  tenantAgent: TenantAgent<AgentModules>
) => Promise<void>

export interface CreateTenantOptions {
  config: Omit<TenantConfig, 'walletConfig'>
}
