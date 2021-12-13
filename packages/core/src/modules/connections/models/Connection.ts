import { Expose, Transform, TransformationType, Type } from 'class-transformer'
import { IsInstance, IsOptional, IsString, ValidateNested } from 'class-validator'

import { DidDocument } from '../../dids'

import { didDocumentFromLegacyDidDocumentFormat, didDocumentToLegacyDidDocumentFormat } from './DidV1Bridge'

export interface ConnectionOptions {
  did: string
  didDoc?: DidDocument
}

export class Connection {
  public constructor(options: ConnectionOptions) {
    if (options) {
      this.did = options.did
      this.didDoc = options.didDoc
    }
  }

  @IsString()
  @Expose({ name: 'DID' })
  public did!: string

  @Expose({ name: 'DIDDoc' })
  @Type(() => DidDocument)
  @ValidateNested()
  @IsInstance(DidDocument)
  @IsOptional()
  @Transform(({ type, value }) => {
    if (type === TransformationType.CLASS_TO_PLAIN) return didDocumentToLegacyDidDocumentFormat(value)
    else if (type === TransformationType.PLAIN_TO_CLASS) return didDocumentFromLegacyDidDocumentFormat(value)
    return value
  })
  public didDoc?: DidDocument
}
