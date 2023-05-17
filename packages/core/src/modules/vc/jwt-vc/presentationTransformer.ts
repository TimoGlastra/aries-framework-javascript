import type { JsonCredential } from './credentialTransformer'
import type { JwtPayloadOptions } from '../../../crypto/jose/jwt'
import type { JsonObject } from '../../../types'

import { JwtPayload } from '../../../crypto/jose/jwt'
import { AriesFrameworkError } from '../../../error'
import { JsonTransformer, isJsonObject } from '../../../utils'
import { W3cPresentation } from '../models/presentation/W3cPresentation'

// TODO: move, rename
export interface JsonPresentation {
  '@context': Array<string> | JsonObject
  id?: string
  type: Array<string>
  holder: string
  verifiableCredential: Array<JsonCredential>
  [key: string]: unknown
}

export function getJwtPayloadFromPresentation(presentation: W3cPresentation) {
  const vp = JsonTransformer.toJSON(presentation) as Partial<JsonPresentation>

  const payloadOptions: JwtPayloadOptions = {
    additionalClaims: {
      vp,
    },
  }

  // TODO: implement
  return new JwtPayload(payloadOptions)
}

export function getPresentationFromJwtPayload(jwtPayload: JwtPayload) {
  if (!('vp' in jwtPayload.additionalClaims) || !isJsonObject(jwtPayload.additionalClaims.vp)) {
    throw new AriesFrameworkError("JWT does not contain a valid 'vp' claim")
  }

  const jwtVp = jwtPayload.additionalClaims.vp

  const dataModelVp = {
    ...jwtVp,
  }

  // FIXME: W3cPresentation does not support jwt vcs yet
  const vpInstance = JsonTransformer.fromJSON(dataModelVp, W3cPresentation)

  return vpInstance
}
