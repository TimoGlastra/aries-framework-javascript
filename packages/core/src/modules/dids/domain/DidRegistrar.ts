import type {
  ParsedDid,
  DidResolutionResult,
  DidResolutionOptions,
  DidCreateOptions,
  DidDeactivateOptions,
  DidUpdateOptions,
  DidCreateResult,
  DidUpdateResult,
  DidDeactivateResult,
} from '../types'

export interface DidResolver {
  readonly supportedMethods: string[]
  resolve(did: string, parsed: ParsedDid, didResolutionOptions: DidResolutionOptions): Promise<DidResolutionResult>
}

export interface DidRegistrar {
  readonly supportedMethods: string[]

  create(options: DidCreateOptions): Promise<DidCreateResult>
  update(options: DidUpdateOptions): Promise<DidUpdateResult>
  deactivate(options: DidDeactivateOptions): Promise<DidDeactivateResult>
}
