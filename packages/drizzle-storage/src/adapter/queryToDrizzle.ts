import { BaseRecord, Query } from '@credo-ts/core'
import { and, eq, or, SQLWrapper } from 'drizzle-orm'
import { PgTable } from 'drizzle-orm/pg-core'

/**
 * Converts a WQL object to Drizzle where conditions
 */
export function queryToDrizzle(query: Query<BaseRecord>, table: PgTable) {
  // Handle empty WQL
  if (!query || Object.keys(query).length === 0) {
    return and()
  }

  const conditions: Array<SQLWrapper | undefined>[] = []

  // Process $or operator
  if (query.$or && Array.isArray(query.$or) && query.$or.length > 0) {
    const _$or = query.$or as Query<BaseRecord>[]
    const _orConditions =
    const _b = or(and())
    conditions.push(or())
  }

  // Process $and operator
  if (wql.$and && Array.isArray(wql.$and) && wql.$and.length > 0) {
    const andConditions = wql.$and.map((condition) => wqlToDrizzle(condition, table))
    conditions.push(and(...andConditions))
  }

  // Process $not operator - now supports both single object and array
  if (wql.$not) {
    if (Array.isArray(wql.$not)) {
      // Handle array of $not conditions
      const notConditions = wql.$not.map((condition) => wqlToDrizzle(condition, table))
      conditions.push(not(and(...notConditions)))
    } else {
      // Handle single $not condition
      conditions.push(not(wqlToDrizzle(wql.$not, table)))
    }
  }

  // Process regular field conditions
  for (const field in wql) {
    // Skip special operators we've already handled
    if (field === '$or' || field === '$and' || field === '$not') {
      continue
    }

    // Check if the field exists in the table
    if (table[field]) {
      conditions.push(eq(table[field], wql[field]))
    } else {
      throw new Error(`Field "${field}" does not exist in the provided table`)
    }
  }

  // Combine all conditions with AND
  return conditions.length === 1 ? conditions[0] : and(...conditions)
}
