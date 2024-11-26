import type { OpenId4VcIssuanceRequest } from './requestContext'
import type { NextFunction, Response } from 'express'

import { Oauth2ServerErrorResponseError, Oauth2ErrorCodes } from '@animo-id/oauth2'

import { getRequestContext, sendOauth2ErrorResponse, sendUnknownServerErrorResponse } from '../../shared/router'
import { OpenId4VcIssuerService } from '../OpenId4VcIssuerService'

export async function clientAuthenticationMiddleware(
  request: OpenId4VcIssuanceRequest,
  response: Response,
  next: NextFunction
) {
  const requestContext = getRequestContext(request)
  const { agentContext, issuer } = requestContext

  try {
    const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService)
    const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer)
    const authorizationServer = openId4VcIssuerService.getOauth2AuthorizationServer(agentContext)

    // TODO: store on issuer record (client attestations required on issuer level for now)
    const requireClientAuthentication = true

    const bodyClientId = request.body.client_id
    if (bodyClientId && typeof bodyClientId !== 'string') {
      throw new Oauth2ServerErrorResponseError({
        error: Oauth2ErrorCodes.InvalidRequest,
        error_description: `The 'client_id' parameter type must be a string`,
      })
    }

    const clientAttestationHeader = request.headers['OAuth-Client-Attestation']
    if (requireClientAuthentication || clientAttestationHeader) {
      // TODO: parse and verify should be separated
      // TODO: should throw appropriate oauth2 server error (or part of other call?)
      const { clientAttestation, clientAttestationPop } = await authorizationServer.verifyClientAttestation({
        authorizationServer: issuerMetadata.credentialIssuer.credential_issuer,
        headers: new Headers(request.headers as Record<string, string>),
      })

      // client_id MUST match if also provided in the body
      if (bodyClientId && clientAttestation.payload.sub !== bodyClientId) {
        throw new Oauth2ServerErrorResponseError({
          error: Oauth2ErrorCodes.InvalidRequest,
          error_description: `The 'client_id' in the request body does not match the 'sub' client id in the client attestation`,
        })
      }

      requestContext.client = {
        clientId: clientAttestation.payload.sub,
        clientAttestation: {
          clientAttestation,
          clientAttestationPop,
        },
      }
    } else {
      if (!bodyClientId) {
        throw new Oauth2ServerErrorResponseError({
          error: Oauth2ErrorCodes.InvalidClient,
          error_description: `Missing required 'client_id' in request body and no client authentication provided.`,
        })
      }
      requestContext.client = {
        clientId: bodyClientId,
      }
    }
  } catch (error) {
    if (error instanceof Oauth2ServerErrorResponseError) {
      return sendOauth2ErrorResponse(response, next, agentContext.config.logger, error)
    }

    return sendUnknownServerErrorResponse(response, next, agentContext.config.logger, error)
  }

  next()
}
