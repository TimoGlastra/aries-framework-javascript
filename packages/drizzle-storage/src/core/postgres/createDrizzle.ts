import { drizzle } from 'drizzle-orm/node-postgres'

export interface CreateDrizzlePostgresOptions<Schema extends Record<string, unknown> = Record<string, never>> {
  type: 'postgres'

  /**
   * The postgres database url
   */
  databaseUrl: string

  /**
   * The schema of the database
   */
  schema: Schema
}

export function createDrizzlePostgres<Schema extends Record<string, unknown> = Record<string, never>>({
  databaseUrl,
  schema,
}: CreateDrizzlePostgresOptions<Schema>) {
  const db = drizzle({
    schema,
    connection: {
      url: databaseUrl,
    },
  })

  // @ts-ignore
  db.type = 'postgres'
  return db
}

export type DrizzlePostgresDatabase<Schema extends Record<string, unknown> = Record<string, never>> = ReturnType<
  typeof createDrizzlePostgres<Schema>
> & { type: 'postgres' }
