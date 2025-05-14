import { JsonTransformer, SdJwtVcRecord } from '@credo-ts/core'
import type { DrizzleDatabase } from '../index'
import { BaseDrizzleRecordAdapter, DrizzleAdapterValues } from '../../adapter/BaseDrizzleRecordAdapter'

export class DrizzleSdJwtVcRecordAdapter extends BaseDrizzleRecordAdapter<SdJwtVcRecord, 'sdJwtVc'> {
  protected constructor(database: DrizzleDatabase) {
    super(database, 'sdJwtVc', 'SdJwtVcRecord')
  }

  public getValues(record: SdJwtVcRecord): DrizzleAdapterValues<'sdJwtVc'> {
    const { alg, sdAlg, vct, ...customTags } = record.getTags()

    return {
      alg,
      sdAlg,
      vct,
      compactSdJwtVc: record.compactSdJwtVc,
      createdAt: record.createdAt,
      customTags,
      id: record.id,
      metadata: record.metadata.data,
      updatedAt: record.updatedAt,
    }
  }

  public toRecord(values: DrizzleAdapterValues<'sdJwtVc'>): SdJwtVcRecord {
    const { alg, vct, sdAlg, customTags, ...remainingValues } = values

    const record = JsonTransformer.fromJSON(remainingValues, SdJwtVcRecord)

    record.setTags({
      ...customTags,
      alg,
      vct,
      sdAlg,
    })

    return record
  }
}
