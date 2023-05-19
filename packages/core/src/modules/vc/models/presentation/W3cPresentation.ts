import type { JsonObject } from '../../../../types'
import type { W3cVerifiableCredential } from '../credential/W3cVerifiableCredential'
import type { ValidationOptions } from 'class-validator'

import { Expose } from 'class-transformer'
import { ValidateNested, buildMessage, IsOptional, ValidateBy } from 'class-validator'

import { SingleOrArray } from '../../../../utils/type'
import { IsUri, IsInstanceOrArrayOfInstances } from '../../../../utils/validators'
import { VERIFIABLE_PRESENTATION_TYPE } from '../../constants'
import { W3cJsonLdVerifiableCredential } from '../../data-integrity/models/W3cJsonLdVerifiableCredential'
import { W3cJwtVerifiableCredential } from '../../jwt-vc/W3cJwtVerifiableCredential'
import { IsCredentialJsonLdContext } from '../../validators'
import { W3cVerifiableCredentialTransformer } from '../credential/W3cVerifiableCredential'

export interface W3cPresentationOptions {
  id?: string
  context: Array<string | JsonObject>
  verifiableCredential: SingleOrArray<W3cVerifiableCredential>
  type: Array<string>
  holder?: string
}

export class W3cPresentation {
  public constructor(options: W3cPresentationOptions) {
    if (options) {
      this.id = options.id
      this.context = options.context
      this.type = options.type
      this.verifiableCredential = options.verifiableCredential
      this.holder = options.holder
    }
  }

  @Expose({ name: '@context' })
  @IsCredentialJsonLdContext()
  public context!: Array<string | JsonObject>

  @IsOptional()
  @IsUri()
  public id?: string

  @IsVerifiablePresentationType()
  public type!: Array<string>

  @IsOptional()
  @IsUri()
  public holder?: string

  // TODO: VC-DATA-MODEL supports VPs without credentials
  @W3cVerifiableCredentialTransformer()
  @IsInstanceOrArrayOfInstances({ classType: [W3cJsonLdVerifiableCredential, W3cJwtVerifiableCredential] })
  @ValidateNested({ each: true })
  public verifiableCredential!: SingleOrArray<W3cVerifiableCredential>
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
