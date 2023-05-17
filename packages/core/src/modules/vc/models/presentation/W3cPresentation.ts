import type { JsonObject } from '../../../../types'
import type { W3cJsonLdVerifiableCredentialOptions } from '../../data-integrity/models/W3cJsonLdVerifiableCredential'
import type { ValidationOptions } from 'class-validator'

import { Expose } from 'class-transformer'
import { buildMessage, IsOptional, IsString, ValidateBy } from 'class-validator'

import { SingleOrArray } from '../../../../utils/type'
import { IsUri, IsInstanceOrArrayOfInstances } from '../../../../utils/validators'
import { VERIFIABLE_PRESENTATION_TYPE } from '../../constants'
import { W3cJsonLdVerifiableCredential } from '../../data-integrity/models/W3cJsonLdVerifiableCredential'
import { W3cJwtVerifiableCredential } from '../../jwt-vc/W3cJwtVerifiableCredential'
import { IsJsonLdContext } from '../../validators'
import { W3cVerifiableCredentialTransformer } from '../credential/W3cVerifiableCredential'

export interface W3cPresentationOptions {
  id?: string
  context: Array<string> | JsonObject
  verifiableCredential: SingleOrArray<W3cJsonLdVerifiableCredentialOptions>
  type: Array<string>
  holder?: string
}

export class W3cPresentation {
  public constructor(options: W3cPresentationOptions) {
    if (options) {
      this.id = options.id
      this.context = options.context
      this.type = options.type
      this.verifiableCredential = Array.isArray(options.verifiableCredential)
        ? options.verifiableCredential.map((vc) => new W3cJsonLdVerifiableCredential(vc))
        : new W3cJsonLdVerifiableCredential(options.verifiableCredential)
      this.holder = options.holder
    }
  }

  @Expose({ name: '@context' })
  @IsJsonLdContext()
  public context!: Array<string> | JsonObject

  @IsOptional()
  @IsUri()
  public id?: string

  @IsVerifiablePresentationType()
  public type!: Array<string>

  @IsOptional()
  @IsString()
  @IsUri()
  public holder?: string

  @W3cVerifiableCredentialTransformer()
  @IsInstanceOrArrayOfInstances({ classType: [W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential] })
  public verifiableCredential!: SingleOrArray<W3cJsonLdVerifiableCredential | W3cJwtVerifiableCredential>
}

// Custom validators

export function IsVerifiablePresentationType(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsVerifiablePresentationType',
      validator: {
        validate: (value): boolean => {
          if (Array.isArray(value)) {
            return value.includes(VERIFIABLE_PRESENTATION_TYPE)
          }
          return false
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be an array of strings which includes "VerifiablePresentation"',
          validationOptions
        ),
      },
    },
    validationOptions
  )
}
