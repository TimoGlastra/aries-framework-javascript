import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseRecordTable } from './baseRecord'
import { Kms } from '@credo-ts/core'

export const sdJwtVcTable = sqliteTable('SdJwtVc', {
  ...baseRecordTable,

  vct: text().notNull(),
  alg: text().$type<Kms.KnownJwaSignatureAlgorithm>().notNull(),
  sdAlg: text('sd_alg').$type<string>().notNull(),

  compactSdJwtVc: text('compact_sd_jwt_vc').notNull(),
})
