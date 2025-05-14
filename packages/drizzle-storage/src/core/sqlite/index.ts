import * as schema from './schema'

const tables = {
  mdoc: schema.mdocTable,
  sdJwtVc: schema.sdJwtVcTable,
} as const

export { tables, schema }
export { type CreateDrizzleSqliteOptions, type DrizzleSqliteDatabase, createDrizzleSqlite } from './createDrizzle'
export { baseRecordTable } from './baseRecord'
