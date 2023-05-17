import type { JsonObject } from '../../../../types'
import type { W3cJsonLdVerifiableCredential } from '../../data-integrity/models/W3cJsonLdVerifiableCredential'

export interface VerifyCredentialResult {
  credential: W3cJsonLdVerifiableCredential
  verified: boolean
  error?: Error
}

export interface W3cVerifyCredentialResult {
  verified: boolean
  statusResult: JsonObject
  results: Array<VerifyCredentialResult>
  error?: Error
}
