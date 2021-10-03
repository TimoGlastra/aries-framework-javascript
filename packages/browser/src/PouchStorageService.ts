import type { BaseRecord, BaseRecordConstructor, StorageService, TagsBase } from '@aries-framework/core'

import { JsonTransformer } from '@aries-framework/core'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import { Lifecycle, scoped } from 'tsyringe'

interface WalletRecord {
  _id: string
  type: string
  value: string
  tags: TagsBase
}

@scoped(Lifecycle.ContainerScoped)
export class PouchStorageService<T extends BaseRecord> implements StorageService<T> {
  private db: PouchDB.Database<WalletRecord>

  public constructor() {
    PouchDB.plugin(PouchDBFind)
    this.db = new PouchDB('aries-framework-javascript')
  }

  public async initialize() {
    const indexes = await this.db.getIndexes()
    const typeIndex = indexes.indexes.find((i) => i.name === 'type')
    if (!typeIndex) {
      await this.db.createIndex({
        index: {
          name: 'type',
          fields: ['type'],
        },
      })
    }
  }

  private recordToInstance(record: WalletRecord, recordClass: BaseRecordConstructor<T>): T {
    const instance = JsonTransformer.deserialize<T>(record.value, recordClass)
    instance.id = record._id

    const tags = record.tags
    instance.replaceTags(tags)

    return instance
  }

  /** @inheritDoc */
  public async save(record: T) {
    const value = JsonTransformer.serialize(record)
    const tags = record.getTags()

    await this.db.put({
      _id: record.id,
      type: record.type,
      value,
      tags,
    })
  }

  /** @inheritDoc */
  public async update(record: T): Promise<void> {
    const storageRecord = await this.db.get(record.id)
    storageRecord.value = JsonTransformer.serialize(record)
    storageRecord.tags = record.getTags()
    await this.db.put(storageRecord)
  }

  /** @inheritDoc */
  public async delete(record: T) {
    const storageRecord = await this.db.get(record.id)
    await this.db.remove(storageRecord)
  }

  /** @inheritDoc */
  public async getById(recordClass: BaseRecordConstructor<T>, id: string): Promise<T> {
    const storageRecord = await this.db.get(id)
    return this.recordToInstance(storageRecord, recordClass)
  }

  /** @inheritDoc */
  public async getAll(recordClass: BaseRecordConstructor<T>): Promise<T[]> {
    const storageRecords = await this.db.find({
      selector: { type: recordClass.type },
    })
    const records = []
    for await (const record of storageRecords.docs) {
      records.push(this.recordToInstance(record, recordClass))
    }
    return records
  }

  private buildQuery(recordClass: BaseRecordConstructor<T>, query: Partial<ReturnType<T['getTags']>>) {
    const transformedTags: { [key: string]: unknown } = {}

    for (const [key, value] of Object.entries(query)) {
      const pouchKey = `tags.${key}`
      if (Array.isArray(value)) {
        transformedTags[pouchKey] = {
          $all: value,
        }
      }
      // Otherwise just use the value
      else {
        transformedTags[pouchKey] = value
      }
    }

    transformedTags.type = recordClass.type

    return transformedTags
  }

  /** @inheritDoc */
  public async findByQuery(
    recordClass: BaseRecordConstructor<T>,
    query: Partial<ReturnType<T['getTags']>>
  ): Promise<T[]> {
    const pouchQuery = this.buildQuery(recordClass, query)
    const storageRecords = await this.db.find({
      selector: pouchQuery,
    })

    const records = []
    for await (const record of storageRecords.docs) {
      records.push(this.recordToInstance(record, recordClass))
    }
    return records
  }
}
