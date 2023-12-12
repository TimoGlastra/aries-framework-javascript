import type { AgentContext } from '../../../agent'
import type { DidResolutionOptions, DidResolutionResult, ParsedDid } from '../types'

export interface DidResolver {
  readonly supportedMethods: string[]
  resolve(
    agentContext: AgentContext,
    did: string,
    parsed: ParsedDid,
    didResolutionOptions: DidResolutionOptions
  ): Promise<DidResolutionResult>
}
