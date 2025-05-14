import { createDrizzle, DrizzleDatabase } from './core'

export interface DrizzleStorageModuleConfigDatabasePostgresOptions {
  type: 'postgres'

  /**
   * The postgres database url
   */
  databaseUrl: string
}

export interface DrizzleStorageModuleConfigDatabaseSqliteOptions {
  type: 'sqlite'

  /**
   * The path to the database file for the SQLite database
   */
  file: string
}

export type DrizzleStorageModuleConfigDatabaseOptions =
  | DrizzleStorageModuleConfigDatabasePostgresOptions
  | DrizzleStorageModuleConfigDatabaseSqliteOptions

export interface DrizzleStorageModuleConfigOptions {
  /**
   * Database configuration used for postgres.
   */
  database: DrizzleStorageModuleConfigDatabaseOptions

  adapters: []
}

/**
 * @public
 */
export class DrizzleStorageModuleConfig {
  private options: DrizzleStorageModuleConfigOptions
  public readonly database: DrizzleDatabase

  public constructor(options: DrizzleStorageModuleConfigOptions) {
    this.options = options
    this.database = createDrizzle(options.database)
  }
}
