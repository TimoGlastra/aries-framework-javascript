import type { W3cVerifiableCredential } from './W3cVerifiableCredential'

export interface W3cVerifyCredentialInnerResult {
  credential: W3cVerifiableCredential | string
  verified: boolean
  error?: Error
}

export interface W3cVerifyCredentialResult {
  verified: boolean
  results: Array<W3cVerifyCredentialInnerResult>
  error?: Error
}
