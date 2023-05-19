import { AriesFrameworkError } from '../../../error'

import { W3cJwtVerifiableCredential } from './W3cJwtVerifiableCredential'

/**
 * Asserts that the given credentials are all JWT VCs
 */
export function assertOnlyW3cJwtVerifiableCredentials(
  credentials: unknown[]
): asserts credentials is W3cJwtVerifiableCredential[] {
  if (credentials.some((c) => !(c instanceof W3cJwtVerifiableCredential))) {
    throw new AriesFrameworkError('JWT VPs can only contain JWT VCs')
  }
}
