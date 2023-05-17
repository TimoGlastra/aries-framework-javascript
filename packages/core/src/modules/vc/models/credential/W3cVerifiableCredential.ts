import type { SingleOrArray } from '../../../../utils'
import type { ClaimFormat } from '../../W3cCredentialServiceOptions'

import { Transform, TransformationType } from 'class-transformer'

import { JsonTransformer } from '../../../../utils'
import { W3cJsonLdVerifiableCredential } from '../../data-integrity/models/W3cJsonLdVerifiableCredential'
import { W3cJwtVerifiableCredential } from '../../jwt-vc/W3cJwtVerifiableCredential'

const getCredential = (v: unknown) =>
  typeof v === 'string'
    ? W3cJwtVerifiableCredential.fromSerializedJwt(v)
    : JsonTransformer.fromJSON(v, W3cJsonLdVerifiableCredential)

const getEncoded = (v: unknown) =>
  v instanceof W3cJwtVerifiableCredential ? v.serializedJwt : JsonTransformer.toJSON(v)

export function W3cVerifiableCredentialTransformer() {
  return Transform(({ value, type }: { value: SingleOrArray<unknown>; type: TransformationType }) => {
    if (type === TransformationType.PLAIN_TO_CLASS) {
      return Array.isArray(value) ? value.map(getCredential) : getCredential(value)
    } else if (type === TransformationType.CLASS_TO_PLAIN) {
      if (Array.isArray(value)) return value.map(getEncoded)
      return getEncoded(value)
    }
    // PLAIN_TO_PLAIN
    return value
  })
}

export type W3cVerifiableCredential<Format extends Extract<ClaimFormat, 'jwt_vc' | 'ldp_vc'> | unknown = unknown> =
  Format extends 'jwt_vc'
    ? W3cJsonLdVerifiableCredential
    : Format extends 'ldp_vc'
    ? W3cJwtVerifiableCredential
    : W3cJsonLdVerifiableCredential | W3cJwtVerifiableCredential
