import { CredoError } from '@credo-ts/core'

export class CredoPostgresError extends CredoError {
  public constructor(message: string, { cause }: { cause?: Error } = {}) {
    super(message, { cause })
  }
}
