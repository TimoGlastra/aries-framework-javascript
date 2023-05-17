import type { W3cPresentation } from '../models'

import { Jwt } from '../../../crypto/jose/jwt/Jwt'

import { getPresentationFromJwtPayload } from './presentationTransformer'

export interface W3cJwtVerifiablePresentationOptions {
  jwt: Jwt
}

export class W3cJwtVerifiablePresentation {
  public readonly jwt: Jwt
  private _presentation: W3cPresentation

  public constructor(options: W3cJwtVerifiablePresentationOptions) {
    this.jwt = options.jwt

    this._presentation = getPresentationFromJwtPayload(this.jwt.payload)
  }

  public static fromSerializedJwt(serializedJwt: string) {
    const jwt = Jwt.fromSerializedJwt(serializedJwt)

    return new W3cJwtVerifiablePresentation({
      jwt,
    })
  }

  public get presentation(): W3cPresentation {
    // TODO: we may want to make this a W3cVerifiablePresentation and add a `proof` property
    // with type `JwtProof2020`. This is done by veramo so you have a consistent model to work
    // with presentations, and don't need to deal with the JWT wrapper. However, this is not in line
    // with the spec, so we need to make sure it's clear that this is a convenience method, and
    // only user for internal processing. The presentation will **never** be shared in this way.
    return this._presentation
  }

  public get serializedJwt(): string {
    return this.jwt.serializedJwt
  }
}
