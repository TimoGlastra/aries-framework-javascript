import type { OpenId4VcRequest } from '../../shared/router'
import type { OpenId4VcIssuerRecord } from '../repository'
import type { Oauth2AuthorizationServer } from '@animo-id/oauth2'

export type ClientAttestationResult = Awaited<ReturnType<Oauth2AuthorizationServer['verifyClientAttestation']>>

export type OpenId4VcIssuanceRequest = OpenId4VcRequest<{
  issuer: OpenId4VcIssuerRecord

  /**
   * If not provided no client id or authentication was present.
   */
  client?: {
    /**
     * The clientId associated with the request. If only the clientId is present
     * it means no client authentication was performed
     */
    clientId: string

    /**
     * The client attestation associated with the request, if provided
     */
    clientAttestation?: ClientAttestationResult
  }
}>
