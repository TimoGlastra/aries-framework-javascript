import { Kms } from '@credo-ts/core'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseRecordTable } from '../sqlite/baseRecord'

export const mdocSqliteTable = sqliteTable('Mdoc', {
  ...baseRecordTable,

  base64Url: text('base64_url').notNull(),
  alg: text().$type<Kms.KnownJwaSignatureAlgorithm>().notNull(),
  docType: text('doc_type').notNull(),
})
