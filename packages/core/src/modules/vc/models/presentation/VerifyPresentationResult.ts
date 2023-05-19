import type { W3cVerifiablePresentation } from './W3cVerifiablePresentation'
import type { JsonObject } from '../../../../types'
import type { W3cVerifyCredentialInnerResult } from '../credential/W3cVerifyCredentialResult'

export interface W3cVerifyPresentationResult {
  verified: boolean
  presentationResult: { verified: boolean; presenation: W3cVerifiablePresentation | string } | JsonObject // the precise interface of this object is still unclear
  credentialResults: Array<W3cVerifyCredentialInnerResult>
  error?: Error
}
