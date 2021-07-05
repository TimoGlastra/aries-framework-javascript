import { BaseRecord } from '../../../storage/BaseRecord'
import { uuid } from '../../../utils/uuid'

export type DefaultCredentialDefinitionTags = {
  schemaId: string
  issuerDid: string
}

export interface CredentialDefinitionRecordProps {
  id?: string
  createdAt?: Date

  schemaId: string
  issuerDid: string
  supportsRevocation: boolean

  // Only needed if supportsRevocation is true
  currentRevocationRegistryId?: string
  revocationRegistrySize?: number
  revocationRegistryAutoScale?: boolean
}

export class CredentialDefinitionRecord extends BaseRecord<DefaultCredentialDefinitionTags> {
  public schemaId!: string
  public issuerDid!: string
  public supportsRevocation!: boolean

  public currentRevocationRegistryId?: string
  public revocationRegistrySize?: number
  public revocationRegistryAutoScale?: boolean

  public static readonly type = 'CredentialDefinitionRecord'
  public readonly type = CredentialDefinitionRecord.type

  public constructor(props: CredentialDefinitionRecordProps) {
    super()

    if (props) {
      this.id = props.id ?? uuid()
      this.createdAt = props.createdAt ?? new Date()
      this._tags = {}

      this.schemaId = props.schemaId
      this.issuerDid = props.issuerDid
      this.supportsRevocation = props.supportsRevocation

      this.currentRevocationRegistryId = props.currentRevocationRegistryId
      this.revocationRegistrySize = props.revocationRegistrySize
      this.revocationRegistryAutoScale = props.revocationRegistryAutoScale
    }
  }

  public getTags() {
    return {
      ...this._tags,
      schemaId: this.schemaId,
      issuerDid: this.issuerDid,
    }
  }
}
