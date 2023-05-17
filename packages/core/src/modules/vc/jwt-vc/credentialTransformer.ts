import type { JwtPayloadOptions } from '../../../crypto/jose/jwt'
import type { JsonObject } from '../../../types'
import type { SingleOrArray } from '../../../utils'

import { isObject } from 'class-validator'

import { JwtPayload } from '../../../crypto/jose/jwt'
import { AriesFrameworkError } from '../../../error'
import { JsonTransformer, isJsonObject } from '../../../utils'
import { W3cCredential } from '../models/credential/W3cCredential'
import { w3cDate } from '../util'

// TODO: move, rename
export interface JsonCredential {
  '@context': Array<string> | JsonObject
  id?: string
  type: Array<string>
  issuer: string | { id?: string }
  issuanceDate: string
  expirationDate?: string
  credentialSubject: SingleOrArray<JsonObject>
  [key: string]: unknown
}

export function getJwtPayloadFromCredential(credential: W3cCredential) {
  const vc = JsonTransformer.toJSON(credential) as Partial<JsonCredential>

  const payloadOptions: JwtPayloadOptions = {
    additionalClaims: {
      vc,
    },
  }

  const issuanceDate = Date.parse(credential.issuanceDate)
  if (!isNaN(issuanceDate)) {
    payloadOptions.nbf = Math.floor(issuanceDate / 1000)
    delete vc.issuanceDate
  }

  if (credential.expirationDate) {
    const expirationDate = Date.parse(credential.expirationDate)
    if (!isNaN(expirationDate)) {
      payloadOptions.exp = Math.floor(expirationDate / 1000)
      delete vc.expirationDate
    }
  }

  payloadOptions.iss = credential.issuerId
  if (typeof vc.issuer === 'string') {
    delete vc.issuer
  } else if (typeof vc.issuer === 'object') {
    delete vc.issuer.id
    if (Object.keys(vc.issuer).length === 0) {
      delete vc.issuer
    }
  }

  if (credential.id) {
    payloadOptions.jti = credential.id
    delete vc.id
  }

  if (Array.isArray(credential.credentialSubject) && credential.credentialSubject.length !== 1) {
    throw new AriesFrameworkError('JWT VCs must have exactly one credential subject')
  }

  const [credentialSubjectId] = credential.credentialSubjectIds
  if (credentialSubjectId) {
    payloadOptions.sub = credentialSubjectId

    if (Array.isArray(vc.credentialSubject)) {
      delete vc.credentialSubject[0].id
    } else {
      delete vc.credentialSubject?.id
    }
  }

  return new JwtPayload(payloadOptions)
}

export function getCredentialFromJwtPayload(jwtPayload: JwtPayload) {
  // TODO: do we want to validate here? NO because then you can't create a VC instance anymore if the cred is expired
  // FIXME: we need to make sure that hte JWT payload matches the vc payload according to the VC data model.
  jwtPayload.validate()

  if (!('vc' in jwtPayload.additionalClaims) || !isJsonObject(jwtPayload.additionalClaims.vc)) {
    throw new AriesFrameworkError("JWT does not contain a valid 'vc' claim")
  }

  const jwtVc = jwtPayload.additionalClaims.vc

  if (!jwtPayload.nbf || !jwtPayload.iss) {
    throw new AriesFrameworkError("JWT does not contain valid 'nbf' and 'iss' claims")
  }

  if (Array.isArray(jwtVc.credentialSubject) && jwtVc.credentialSubject.length !== 1) {
    throw new AriesFrameworkError('JWT VCs must have exactly one credential subject')
  }

  if (Array.isArray(jwtVc.credentialSubject) && !isObject(jwtVc.credentialSubject[0])) {
    throw new AriesFrameworkError('JWT VCs must have a credential subject of type object')
  }

  const credentialSubject = Array.isArray(jwtVc.credentialSubject)
    ? jwtVc.credentialSubject[0]
    : jwtVc.credentialSubject
  if (!isJsonObject(credentialSubject)) {
    throw new AriesFrameworkError('JWT VC does not have a valid credential subject')
  }

  // Create a verifiable credential structure that is compatible with the VC data model
  const dataModelVc = {
    ...jwtVc,
    issuanceDate: w3cDate(jwtPayload.nbf * 1000),
    expirationDate: jwtPayload.exp ? w3cDate(jwtPayload.exp * 1000) : undefined,
    issuer: typeof jwtVc.issuer === 'object' ? { ...jwtVc.issuer, id: jwtPayload.iss } : jwtPayload.iss,
    id: jwtPayload.jti,
    // TODO: simplify. Does it matter if the credential uses an array and we use an object? We won't use
    // this structure for integrity anyway
    credentialSubject: Array.isArray(jwtVc.credentialSubject)
      ? [
          {
            ...credentialSubject,
            id: jwtPayload.sub,
          },
        ]
      : jwtVc.credentialSubject,
  }

  const vcInstance = JsonTransformer.fromJSON(dataModelVc, W3cCredential)

  return vcInstance
}
