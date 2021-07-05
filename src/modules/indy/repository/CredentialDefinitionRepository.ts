import { inject, scoped, Lifecycle } from 'tsyringe'

import { InjectionSymbols } from '../../../constants'
import { Repository } from '../../../storage/Repository'
import { StorageService } from '../../../storage/StorageService'

import { CredentialDefinitionRecord } from './CredentialDefinitionRecord'

@scoped(Lifecycle.ContainerScoped)
export class CredentialDefinitionRepository extends Repository<CredentialDefinitionRecord> {
  public constructor(@inject(InjectionSymbols.StorageService) storageService: StorageService) {
    super(CredentialDefinitionRecord, storageService)
  }
}
