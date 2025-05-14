import { pgTable, text } from 'drizzle-orm/pg-core'
import { baseRecordTable } from '../postgres/baseRecord'
import { Kms } from '@credo-ts/core'

export const mdocPostgresTable = pgTable('Mdoc', {
  ...baseRecordTable,

  base64Url: text('base64_url').notNull(),
  alg: text().$type<Kms.KnownJwaSignatureAlgorithm>().notNull(),
  docType: text('doc_type').notNull(),
})
