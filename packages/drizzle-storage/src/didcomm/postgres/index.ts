import * as schema from './schema'

const tables = {
  didcommConnection: schema.didcommConnectionTable,
} as const

export { schema, tables }
