import { DidError } from './DidError'

export class DidOperationNotSupported extends DidError {
  public constructor(message: string, { cause }: { cause?: Error } = {}) {
    super(message, { cause })
  }
}
