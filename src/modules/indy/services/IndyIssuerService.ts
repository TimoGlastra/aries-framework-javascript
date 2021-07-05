import type {
  default as Indy,
  CredDef,
  Schema,
  Cred,
  CredDefId,
  CredOffer,
  CredReq,
  CredRevocId,
  CredValues,
  BlobReaderHandle,
  RevocRegDef,
  BlobWriterHandle,
  RevocRegDelta,
} from 'indy-sdk'

import { inject, Lifecycle, scoped } from 'tsyringe'

import { InjectionSymbols } from '../../../constants'
import { AriesFrameworkError } from '../../../error'
import { FileSystem } from '../../../storage/fs/FileSystem'
import { getDirFromFilePath } from '../../../utils/path'
import { IndyWallet } from '../../../wallet/IndyWallet'
import { LedgerService } from '../../ledger'
import { CredentialDefinitionRecord } from '../repository/CredentialDefinitionRecord'
import { CredentialDefinitionRepository } from '../repository/CredentialDefinitionRepository'

@scoped(Lifecycle.ContainerScoped)
export class IndyIssuerService {
  private indy: typeof Indy
  private indyWallet: IndyWallet
  private fileSystem: FileSystem
  private ledgerService: LedgerService
  private credentialDefinitionRepository: CredentialDefinitionRepository

  public constructor(
    @inject(InjectionSymbols.Indy) indy: typeof Indy,
    indyWallet: IndyWallet,
    @inject(InjectionSymbols.FileSystem) fileSystem: FileSystem,
    ledgerService: LedgerService,
    credentialDefinitionRepository: CredentialDefinitionRepository
  ) {
    this.indy = indy
    this.indyWallet = indyWallet
    this.fileSystem = fileSystem
    this.ledgerService = ledgerService
    this.credentialDefinitionRepository = credentialDefinitionRepository
  }

  /**
   * Create a new credential schema and register it on the ledger
   *
   * @returns the schema.
   */
  public async createSchema({ originDid, name, version, attributes }: CreateSchemaOptions): Promise<Schema> {
    let [, schema] = await this.indy.issuerCreateSchema(originDid, name, version, attributes)

    schema = await this.ledgerService.registerSchema(originDid, schema)

    return schema
  }

  /**
   * Create a new credential definition, store it in the wallet and register it on the ledger
   *
   * @returns the credential definition.
   */
  public async createCredentialDefinition({
    issuerDid,
    schema,
    tag = 'default',
    enableRevocation = false,
    // TODO: do we want to provide default for this?
    revocationRegistrySize = 10000,
    revocationRegistryAutoScale = false,
  }: CreateCredentialDefinitionOptions): Promise<CredDef> {
    // Create credential definition
    const [, credentialDefinition] = await this.indy.issuerCreateAndStoreCredentialDef(
      this.indyWallet.walletHandle,
      issuerDid,
      schema,
      tag,
      'CL',
      {
        support_revocation: enableRevocation,
      }
    )

    // Register credential definition on leger
    await this.ledgerService.registerCredentialDefinition(issuerDid, credentialDefinition)

    // Create definition record
    const definitionRecord = new CredentialDefinitionRecord({
      id: credentialDefinition.id,
      schemaId: schema.id,
      issuerDid,
      supportsRevocation: enableRevocation,
    })

    // If enabling revocation, also create a revocation registry
    if (enableRevocation) {
      const [revocationRegistry] = await this.createRevocationRegistry({
        issuerDid,
        credentialDefinitionId: credentialDefinition.id,
        revocationRegistrySize,
        tag: `1-${revocationRegistrySize}`,
        // TODO: not sure we want to pass this here. Prob use global for this
        tailsBaseDir: `${this.fileSystem.baseDir}/tails`,
      })

      definitionRecord.revocationRegistrySize = revocationRegistrySize
      definitionRecord.revocationRegistryAutoScale = revocationRegistryAutoScale
      definitionRecord.currentRevocationRegistryId = revocationRegistry.id
    }

    await this.credentialDefinitionRepository.save(definitionRecord)

    return credentialDefinition
  }

  /**
   * Create a credential offer for the given credential definition id.
   *
   * @param credentialDefinitionId The credential definition to create an offer for
   * @returns The created credential offer
   */
  public async createCredentialOffer(credentialDefinitionId: CredDefId) {
    return this.indy.issuerCreateCredentialOffer(this.indyWallet.walletHandle, credentialDefinitionId)
  }

  /**
   * Create a credential.
   *
   * @returns Credential and revocation id
   */
  public async createCredential({
    credentialOffer,
    credentialRequest,
    credentialValues,
    revocationRegistryId,
    tailsFilePath,
  }: CreateCredentialOptions): Promise<[Cred, CredRevocId]> {
    // Indy SDK requires tailsReaderHandle. Use null if no tailsFilePath is present
    const tailsReaderHandle = tailsFilePath ? await this.createTailsReader(tailsFilePath) : 0

    if (revocationRegistryId || tailsFilePath) {
      throw new Error('Revocation not supported yet')
    }

    const [credential, credentialRevocationId] = await this.indy.issuerCreateCredential(
      this.indyWallet.walletHandle,
      credentialOffer,
      credentialRequest,
      credentialValues,
      revocationRegistryId ?? null,
      tailsReaderHandle
    )

    return [credential, credentialRevocationId]
  }

  /**
   * Create a new revocation registry, store it in the wallet and register it on the ledger
   *
   * @returns the revocation registry and entry
   */
  public async createRevocationRegistry({
    issuerDid,
    tag,
    credentialDefinitionId,
    revocationRegistrySize = 10000,
    tailsBaseDir = `${this.fileSystem.baseDir}/tails`,
  }: CreateRevocationRegistryOptions): Promise<[RevocRegDef, RevocRegDelta]> {
    const tailsWriterHandle = await this.createTailsWriter(tailsBaseDir)

    const [, revocationRegistry, revocationRegistryEntry] = await this.indy.issuerCreateAndStoreRevocReg(
      this.indyWallet.walletHandle,
      issuerDid,
      'CL_ACCUM',
      tag,
      credentialDefinitionId,
      {
        max_cred_num: revocationRegistrySize,
      },
      tailsWriterHandle
    )

    await this.ledgerService.registerRevocationRegistry(issuerDid, revocationRegistry)

    return [revocationRegistry, revocationRegistryEntry]
  }

  /**
   * Get a handler for the blob storage tails file reader.
   *
   * @param tailsFilePath The path of the tails file
   * @returns The blob storage reader handle
   */
  private async createTailsReader(tailsFilePath: string): Promise<BlobReaderHandle> {
    const tailsFileExists = await this.fileSystem.exists(tailsFilePath)

    // Extract directory from path (should also work with windows paths)
    const dirname = getDirFromFilePath(tailsFilePath)

    if (!tailsFileExists) {
      throw new AriesFrameworkError(`Tails file does not exist at path ${tailsFilePath}`)
    }

    const tailsReaderConfig = {
      base_dir: dirname,
    }

    return this.indy.openBlobStorageReader('default', tailsReaderConfig)
  }

  /**
   * Get a handler for the blob storage tails file writer.
   *
   * @param tailsBaseDir The base path for tails files
   * @returns The blob storage writer handle
   */
  private async createTailsWriter(tailsBaseDir: string): Promise<BlobWriterHandle> {
    const tailsWriterConfig = {
      base_dir: tailsBaseDir,
      uri_pattern: '',
    }

    return this.indy.openBlobStorageWriter('default', tailsWriterConfig)
  }
}

export interface CreateCredentialDefinitionOptions {
  issuerDid: string
  schema: Schema
  tag?: string
  enableRevocation?: boolean
  revocationRegistrySize?: number
  revocationRegistryAutoScale?: boolean
}

export interface CreateCredentialOptions {
  credentialOffer: CredOffer
  credentialRequest: CredReq
  credentialValues: CredValues
  revocationRegistryId?: string
  tailsFilePath?: string
}

export interface CreateSchemaOptions {
  originDid: string
  name: string
  version: string
  attributes: string[]
}

export interface CreateRevocationRegistryOptions {
  issuerDid: string
  tag: string
  credentialDefinitionId: string
  revocationRegistrySize: number
  tailsBaseDir: string
}
