import { inject, scoped, Lifecycle } from 'tsyringe'

import { InjectionSymbols } from '../../../constants'
import { Repository } from '../../../storage/Repository'
import { StorageService } from '../../../storage/StorageService'

import { MediationRecord } from './MediationRecord'

@scoped(Lifecycle.ContainerScoped)
export class MediationRepository extends Repository<MediationRecord> {
  public constructor(@inject(InjectionSymbols.StorageService) storageService: StorageService<MediationRecord>) {
    super(MediationRecord, storageService)
  }

  public getSingleByRecipientKey(recipientKey: string) {
    // TODO: would be nice if the query method could automatically handle arrays
    const tag = `recipientKey:${recipientKey}`

    return this.getSingleByQuery({
      [tag]: true,
    })
  }

  public async getByConnectionId(connectionId: string): Promise<MediationRecord> {
    return this.getSingleByQuery({ connectionId })
  }
}