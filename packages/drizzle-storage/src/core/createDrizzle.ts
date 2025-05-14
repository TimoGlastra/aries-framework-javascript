import { CredoError } from '@credo-ts/core'
import { createDrizzlePostgres, CreateDrizzlePostgresOptions, DrizzlePostgresDatabase } from './postgres'
import { createDrizzleSqlite, CreateDrizzleSqliteOptions, DrizzleSqliteDatabase } from './sqlite'

export type CreateDrizzleOptions<Schema extends Record<string, unknown> = Record<string, never>> =
  | CreateDrizzlePostgresOptions<Schema>
  | CreateDrizzleSqliteOptions<Schema>

export function createDrizzle<
  PostgresSchema extends Record<string, unknown> = Record<string, never>,
  SqliteSchema extends Record<string, unknown> = Record<string, never>,
>(options: CreateDrizzlePostgresOptions<PostgresSchema> | CreateDrizzleSqliteOptions<SqliteSchema>) {
  if (options.type === 'postgres') {
    return createDrizzlePostgres<PostgresSchema>(options)
  }

  if (options.type === 'sqlite') {
    return createDrizzleSqlite<SqliteSchema>(options)
  }

  // @ts-expect-error
  throw new CredoError(`Unsupported database type ${options.type}`)
}

export type DrizzleDatabase<
  PostgresSchema extends Record<string, unknown> = Record<string, never>,
  SqliteSchema extends Record<string, unknown> = Record<string, never>,
> = DrizzlePostgresDatabase<PostgresSchema> | DrizzleSqliteDatabase<SqliteSchema>
