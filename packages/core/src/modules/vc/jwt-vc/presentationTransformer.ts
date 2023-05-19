import type { JwtPayloadOptions } from '../../../crypto/jose/jwt'
import type { W3cJsonPresentation } from '../models/presentation/W3cJsonPresentation'

import { JwtPayload } from '../../../crypto/jose/jwt'
import { AriesFrameworkError } from '../../../error'
import { JsonTransformer, isJsonObject } from '../../../utils'
import { W3cPresentation } from '../models/presentation/W3cPresentation'

export function getJwtPayloadFromPresentation(presentation: W3cPresentation) {
  const vp = JsonTransformer.toJSON(presentation) as Partial<W3cJsonPresentation>

  const payloadOptions: JwtPayloadOptions = {
    additionalClaims: {
      vp,
    },
  }

  if (presentation.holder) {
    payloadOptions.iss = presentation.holder
    delete vp.holder
  }

  if (presentation.id) {
    payloadOptions.jti = presentation.id
    delete vp.id
  }

  return new JwtPayload(payloadOptions)
}

export function getPresentationFromJwtPayload(jwtPayload: JwtPayload) {
  if (!('vp' in jwtPayload.additionalClaims) || !isJsonObject(jwtPayload.additionalClaims.vp)) {
    throw new AriesFrameworkError("JWT does not contain a valid 'vp' claim")
  }

  const jwtVp = jwtPayload.additionalClaims.vp

  // Validate vp.id and jti
  if (jwtVp.id && jwtPayload.jti !== jwtVp.id) {
    throw new AriesFrameworkError('JWT jti and vp.id do not match')
  }

  // Validate vp.holder and iss
  if (jwtVp.holder && jwtPayload.iss !== jwtVp.holder) {
    throw new AriesFrameworkError('JWT iss and vp.holder do not match')
  }

  const dataModelVp = {
    ...jwtVp,
    id: jwtPayload.jti,
    holder: jwtPayload.iss,
  }

  const vpInstance = JsonTransformer.fromJSON(dataModelVp, W3cPresentation)

  return vpInstance
}
