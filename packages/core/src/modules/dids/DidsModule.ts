import type { Key } from './domain/Key'
import type { DidResolutionOptions } from './types'

import { inject, Lifecycle, scoped } from 'tsyringe'

import { AgentContext } from '../../agent'
import { InjectionSymbols } from '../../constants'

import { DidRepository } from './repository'
import { DidResolverService } from './services/DidResolverService'

@scoped(Lifecycle.ContainerScoped)
export class DidsModule {
  private resolverService: DidResolverService
  private didRepository: DidRepository
  private agentContext: AgentContext

  public constructor(
    resolverService: DidResolverService,
    didRepository: DidRepository,
    @inject(InjectionSymbols.AgentContext) agentContext: AgentContext
  ) {
    this.resolverService = resolverService
    this.didRepository = didRepository
    this.agentContext = agentContext
  }

  public resolve(didUrl: string, options?: DidResolutionOptions) {
    return this.resolverService.resolve(this.agentContext, didUrl, options)
  }

  public resolveDidDocument(didUrl: string) {
    return this.resolverService.resolveDidDocument(this.agentContext, didUrl)
  }

  public findByRecipientKey(recipientKey: Key) {
    return this.didRepository.findByRecipientKey(this.agentContext, recipientKey)
  }

  public findAllByRecipientKey(recipientKey: Key) {
    return this.didRepository.findAllByRecipientKey(this.agentContext, recipientKey)
  }
}
