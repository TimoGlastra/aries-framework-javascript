/**
 * Adapter between a specific Record class and the record Type
 */

import { BaseRecord, CredoError, Query } from '@credo-ts/core'
import { and, eq, not, or, Simplify, sql, SQL, SQLWrapper } from 'drizzle-orm'
import { SQLiteTable as _SQLiteTable, sqliteTable } from 'drizzle-orm/sqlite-core'
import { PgColumn, PgTable, pgTable } from 'drizzle-orm/pg-core'
import { DrizzleDatabase } from '../core/createDrizzle'
import { baseRecordTable } from '../core/postgres'
import { baseRecordTable as baseRecordTable2 } from '../core/sqlite'

/**
 * A utility function that provides type-safe access to JSON/JSONB fields in PostgreSQL
 *
 * @param column The JSON/JSONB column to access
 * @param paths Path segments to the desired JSON property
 * @returns An SQL fragment that can be used in queries
 */
export function jsonPath<T extends PgColumn>(column: T, ...paths: (string | number)[]): SQL<unknown> {
  if (paths.length === 0) {
    return sql`${column}`
  }

  // Start with the column reference
  let result = sql`${column}`

  // For all path segments except the last one, use the -> operator (returns JSON)
  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i]
    result = sql`${result}->'${path}'`
  }

  // For the last path segment, use ->> operator (returns text)
  const lastPath = paths[paths.length - 1]
  result = sql`${result}->>'${lastPath}'`

  return result
}

export type DrizzleAdapterValues<Table extends _SQLiteTable> = Simplify<{
  [Key in keyof Table['$inferInsert']]: Table['$inferInsert'][Key]
}>
export abstract class BaseDrizzleRecordAdapter<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  CredoRecord extends BaseRecord<any, any, any>,
  PostgresTable extends ReturnType<typeof pgTable<string, typeof baseRecordTable>>,
  PostgresSchema extends Record<string, unknown>,
  SQLiteTable extends ReturnType<typeof sqliteTable<string, typeof baseRecordTable2>>,
  SQLiteSchema extends Record<string, unknown>,
> {
  public recordType: CredoRecord['type']

  public table: {
    postgres: PostgresTable
    sqlite: SQLiteTable
  }

  protected constructor(
    public database: DrizzleDatabase<PostgresSchema, SQLiteSchema>,
    table: {
      postgres: PostgresTable
      sqlite: SQLiteTable
    },
    recordType: CredoRecord['type']
  ) {
    this.table = table
    this.recordType = recordType
  }

  public abstract getValues(record: CredoRecord): DrizzleAdapterValues<SQLiteTable>
  public abstract toRecord(values: DrizzleAdapterValues<SQLiteTable>): CredoRecord

  protected get idColumn() {
    if (this.database.type === 'postgres') {
      return this.table.postgres.id
    }

    if (this.database.type === 'sqlite') {
      return this.table.sqlite.id
    }

    // @ts-expect-error
    throw new CredoError(`Unsupported database type '${this.database.type}'`)
  }

  protected column<Column extends (typeof this.table)[typeof this.database.type]['$inferInsert']>(
    column: Column
  ): Column extends keyof (typeof this.table)[typeof this.database.type]['$inferInsert']
    ? (typeof this.table)[typeof this.database.type][Column]
    : never {
    if (this.database.type === 'postgres') {
      return this.table.postgres[column as keyof typeof this.table.postgres]
    }
    if (this.database.type === 'sqlite') {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return this.table.sqlite[column as keyof typeof this.table.sqlite] as any
    }

    // @ts-expect-error
    throw new CredoError(`Unsupported database type '${database.type}'`)
  }

  //   $and?: Query<T>[]
  // $or?: Query<T>[]
  // $not?: Query<T>
  private queryToWhere(query: Query<CredoRecord>) {
    const where: SQLWrapper[] = []

    for (const [tag, value] of Object.entries(query)) {
      if (tag === '$or') {
        where.push(or(...value.flatMap(this.queryToWhere)))
      } else if (tag === '$and') {
        where.push(...value.flatMap(this.queryToWhere))
      } else if (tag === '$not') {
        not
        where.push(...value.flatMap(this.queryToWhere))
      } else {
        where.push(
          // TODO: array support for tags
          eq(
            // This means we can't have a inconsistency between the types in the database and the record
            tag in this.table.postgres ? this.table.postgres[tag] : jsonPath(this.table.postgres.customTags, tag),
            value
          )
        )
      }
    }

    return where
  }

  public async query(query: Query<CredoRecord>) {
    if (this.database.type === 'postgres') {
      const _results = await this.database
        .select()
        .from(this.table.postgres as PgTable)
        .where(and(...this.queryToWhere(query)))
      // .limit(1)
    }
  }

  public async insert(record: CredoRecord) {
    if (this.database.type === 'postgres') {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      await this.database.insert(this.table.postgres).values(this.getValues(record) as any)
    }

    if (this.database.type === 'sqlite') {
      await this.database.insert(this.table.sqlite).values(this.getValues(record))
    }

    // @ts-expect-error
    throw new CredoError(`Unsupported database type '${database.type}'`)
  }

  public async update(record: CredoRecord) {
    if (this.database.type === 'postgres') {
      await this.database
        .update(this.table.postgres)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .set(this.getValues(record) as any)
        .where(eq(this.idColumn, record.id))
    }

    if (this.database.type === 'sqlite') {
      await this.database
        .update(this.table.sqlite)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .set(this.getValues(record) as any)
        .where(eq(this.idColumn, record.id))
    }

    // @ts-expect-error
    throw new CredoError(`Unsupported database type '${database.type}'`)
  }

  public async delete(id: string) {
    if (this.database.type === 'postgres') {
      await this.database.delete(this.table.postgres).where(eq(this.idColumn, id))
    }

    if (this.database.type === 'sqlite') {
      await this.database.delete(this.table.sqlite).where(eq(this.idColumn, id))
    }

    // @ts-expect-error
    throw new CredoError(`Unsupported database type '${database.type}'`)
  }
}
