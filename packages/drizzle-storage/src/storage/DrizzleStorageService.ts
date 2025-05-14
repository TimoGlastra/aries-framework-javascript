import type {
  AgentContext,
  BaseRecord,
  BaseRecordConstructor,
  Query,
  QueryOptions,
  StorageService,
} from '@credo-ts/core'
import { injectable } from '@credo-ts/core'

@injectable()
export class DrizzleStorageService<T extends BaseRecord> implements StorageService<T> {
  public constructor() {}

  save(_agentContext: AgentContext, _record: T): Promise<void> {
    throw new Error('Method not implemented.')
  }
  update(_agentContext: AgentContext, _record: T): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delete(_agentContext: AgentContext, _record: T): Promise<void> {
    throw new Error('Method not implemented.')
  }
  deleteById(_agentContext: AgentContext, _recordClass: BaseRecordConstructor<T>, _id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  getById(_agentContext: AgentContext, _recordClass: BaseRecordConstructor<T>, _id: string): Promise<T> {
    throw new Error('Method not implemented.')
  }
  getAll(_agentContext: AgentContext, _recordClass: BaseRecordConstructor<T>): Promise<T[]> {
    throw new Error('Method not implemented.')
  }
  findByQuery(
    _agentContext: AgentContext,
    _recordClass: BaseRecordConstructor<T>,
    _query: Query<T>,
    _queryOptions?: QueryOptions
  ): Promise<T[]> {
    throw new Error('Method not implemented.')
  }
}
