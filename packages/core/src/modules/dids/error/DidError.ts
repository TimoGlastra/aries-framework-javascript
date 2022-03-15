import { AriesFrameworkError } from '../../../error/AriesFrameworkError'

export class DidError extends AriesFrameworkError {
  public constructor(message: string, { cause }: { cause?: Error } = {}) {
    super(message, { cause })
  }
}
