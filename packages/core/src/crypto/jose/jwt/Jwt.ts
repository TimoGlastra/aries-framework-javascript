import type { Buffer } from '../../../utils'

import { AriesFrameworkError } from '../../../error'
import { JsonEncoder, TypedArrayEncoder } from '../../../utils'

import { JwtPayload } from './JwtPayload'

// TODO: JWT Header typing
interface JwtHeader {
  alg: string
  [key: string]: unknown
}

interface JwtOptions {
  payload: JwtPayload
  header: JwtHeader
  signature: Buffer

  serializedJwt: string
}

export class Jwt {
  private static format = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/

  public readonly payload: JwtPayload
  public readonly header: JwtHeader
  public readonly signature: Buffer

  /**
   * Compact serialization of the JWT. Contains the payload, header, and signature.
   */
  public readonly serializedJwt: string

  private constructor(options: JwtOptions) {
    this.serializedJwt = options.serializedJwt

    this.payload = options.payload
    this.header = options.header
    this.signature = options.signature
  }

  public static fromSerializedJwt(jwt: string) {
    if (typeof jwt !== 'string' || !Jwt.format.test(jwt)) {
      throw new AriesFrameworkError(`Invalid JWT. '${jwt}' does not match JWT regex`)
    }

    const [header, payload, signature] = jwt.split('.')

    return new Jwt({
      header: JsonEncoder.fromBase64(header),
      payload: JwtPayload.fromJson(JsonEncoder.fromBase64(payload)),
      signature: TypedArrayEncoder.fromBase64(signature),
      serializedJwt: jwt,
    })
  }
}
