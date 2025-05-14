import { JsonTransformer, MdocRecord } from '@credo-ts/core'

import { BaseDrizzleRecordAdapter, DrizzleAdapterValues } from '../../adapter/BaseDrizzleRecordAdapter'

import * as postgres from './postgres'
import * as sqlite from './sqlite'
import { DrizzleDatabase } from '../createDrizzle'

type DrizzleMdocAdapterValues = DrizzleAdapterValues<(typeof sqlite)['mdocSqliteTable']>
export class DrizzleMdocRecordAdapter extends BaseDrizzleRecordAdapter<
  MdocRecord,
  typeof postgres.mdocPostgresTable,
  typeof postgres,
  typeof sqlite.mdocSqliteTable,
  typeof sqlite
> {
  protected constructor(database: DrizzleDatabase<typeof postgres, typeof sqlite>) {
    super(database, { postgres: postgres.mdocPostgresTable, sqlite: sqlite.mdocSqliteTable }, 'MdocRecord')
  }

  public getValues(record: MdocRecord): DrizzleMdocAdapterValues {
    const { alg, docType, ...customTags } = record.getTags()

    return {
      alg,
      docType,
      base64Url: record.base64Url,
      createdAt: record.createdAt,
      customTags,
      id: record.id,
      metadata: record.metadata.data,
      updatedAt: record.updatedAt,
    }
  }

  public toRecord(values: DrizzleMdocAdapterValues): MdocRecord {
    const { alg, docType, customTags, ...remainingValues } = values

    const record = JsonTransformer.fromJSON(remainingValues, MdocRecord)
    record.setTags({
      alg,
      docType,
      ...customTags,
    })

    return record
  }
}
