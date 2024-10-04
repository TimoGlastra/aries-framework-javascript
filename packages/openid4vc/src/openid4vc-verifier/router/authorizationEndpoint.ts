import type { OpenId4VcVerificationRequest } from './requestContext'
import type { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import type { Router, Response } from 'express'

import { getRequestContext, sendErrorResponse } from '../../shared/router'
import { OpenId4VcSiopVerifierService } from '../OpenId4VcSiopVerifierService'
import { AgentContext, Jwt, Key } from '@credo-ts/core'

export interface OpenId4VcSiopAuthorizationEndpointConfig {
  /**
   * The path at which the authorization endpoint should be made available. Note that it will be
   * hosted at a subpath to take into account multiple tenants and verifiers.
   *
   * @default /authorize
   */
  endpointPath: string

  // for b' flow
  getVerifyHs256Callback?: (context: AgentContext, verifierKey: Record<string, unknown>) => ((key: Key, data: Uint8Array, signatureInBase64url: string) => Promise<boolean>)
}

export function configureAuthorizationEndpoint(router: Router, config: OpenId4VcSiopAuthorizationEndpointConfig) {
  router.post(config.endpointPath, async (request: OpenId4VcVerificationRequest, response: Response, next) => {
    const { agentContext, verifier } = getRequestContext(request)

    try {
      const openId4VcVerifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService)
      const isVpRequest = request.body.presentation_submission !== undefined

      const authorizationResponse: AuthorizationResponsePayload = request.body
      if (isVpRequest) authorizationResponse.presentation_submission = JSON.parse(request.body.presentation_submission)

      const verificationSession = await openId4VcVerifierService.findVerificationSessionForAuthorizationResponse(
        agentContext,
        {
          authorizationResponse,
          verifierId: verifier.verifierId,
        }
      )

      if (!verificationSession) {
        agentContext.config.logger.warn(
          `No verification session found for incoming authorization response for verifier ${verifier.verifierId}`
        )
        return sendErrorResponse(response, agentContext.config.logger, 404, 'invalid_request', null)
      }

      let verifyHs256Callback = undefined
      const parsedAuthorizationRequest = Jwt.fromSerializedJwt(verificationSession.authorizationRequestJwt)
      const rpEphPub = parsedAuthorizationRequest.payload.additionalClaims.rp_eph_pub
      if (rpEphPub) {
        if (!config.getVerifyHs256Callback) throw new Error('Expected getVerifyHs256Callback when receiving an rp_eph_pub')
        verifyHs256Callback = config.getVerifyHs256Callback(agentContext, rpEphPub as Record<string, unknown>)
      }

      await openId4VcVerifierService.verifyAuthorizationResponse(agentContext, {
        authorizationResponse: request.body,
        verificationSession,
        verifyHs256Callback
      })
      response.status(200).send()
    } catch (error) {
      sendErrorResponse(response, agentContext.config.logger, 500, 'invalid_request', error)
    }

    // NOTE: if we don't call next, the agentContext session handler will NOT be called
    next()
  })
}
