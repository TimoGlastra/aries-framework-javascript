import type { Logger } from '../../../logger'
import type {
  default as Indy,
  CredDefId,
  Did,
  LedgerRequest,
  PoolHandle,
  Schema,
  SchemaId,
  LedgerReadReplyResponse,
  LedgerWriteReplyResponse,
  RevocRegDef,
} from 'indy-sdk'

import { inject, scoped, Lifecycle } from 'tsyringe'

import { AgentConfig } from '../../../agent/AgentConfig'
import { InjectionSymbols } from '../../../constants'
import { FileSystem } from '../../../storage/fs/FileSystem'
import { isIndyError } from '../../../utils/indyError'
import { Wallet } from '../../../wallet/Wallet'

@scoped(Lifecycle.ContainerScoped)
export class LedgerService {
  private wallet: Wallet
  private indy: typeof Indy
  private logger: Logger
  private _poolHandle?: PoolHandle
  private authorAgreement?: AuthorAgreement | null
  private agentConfig: AgentConfig
  private fileSystem: FileSystem

  public constructor(
    @inject(InjectionSymbols.Wallet) wallet: Wallet,
    agentConfig: AgentConfig,
    @inject(InjectionSymbols.FileSystem) fileSystem: FileSystem
  ) {
    this.wallet = wallet
    this.agentConfig = agentConfig
    this.indy = agentConfig.indy
    this.logger = agentConfig.logger
    this.fileSystem = fileSystem
  }

  private async getPoolHandle() {
    if (!this._poolHandle) {
      return this.connect()
    }

    return this._poolHandle
  }

  public async connect() {
    const poolName = this.agentConfig.poolName
    const genesisPath = await this.getGenesisPath()

    if (!genesisPath) {
      throw new Error('Cannot connect to ledger without genesis file')
    }

    this.logger.debug(`Connecting to ledger pool '${poolName}'`, { genesisPath })
    try {
      this.logger.debug(`Creating pool '${poolName}'`)
      await this.indy.createPoolLedgerConfig(poolName, { genesis_txn: genesisPath })
    } catch (error) {
      if (isIndyError(error, 'PoolLedgerConfigAlreadyExistsError')) {
        this.logger.debug(`Pool '${poolName}' already exists`, {
          indyError: 'PoolLedgerConfigAlreadyExistsError',
        })
      } else {
        throw error
      }
    }

    this.logger.debug('Setting ledger protocol version to 2')
    await this.indy.setProtocolVersion(2)

    this.logger.debug(`Opening pool ${poolName}`)
    this._poolHandle = await this.indy.openPoolLedger(poolName)
    return this._poolHandle
  }

  public async getPublicDid(did: Did) {
    try {
      this.logger.debug(`Get public did '${did}' from ledger`)
      const request = await this.indy.buildGetNymRequest(null, did)

      this.logger.debug(`Submitting get did request for did '${did}' to ledger`)
      const response = await this.indy.submitRequest(await this.getPoolHandle(), request)

      const result = await this.indy.parseGetNymResponse(response)
      this.logger.debug(`Retrieved did '${did}' from ledger`, result)

      return result
    } catch (error) {
      this.logger.error(`Error retrieving did '${did}' from ledger`, {
        error,
        did,
        poolHandle: await this.getPoolHandle(),
      })

      throw error
    }
  }

  /**
   * Register a schema on the ledger
   *
   * @param did The did to use to register the schema
   * @param schema The schema to register
   * @returns The schema with updated `seqNo`
   */
  public async registerSchema(did: Did, schema: Indy.Schema): Promise<Schema> {
    try {
      this.logger.debug(`Register schema '${schema.id}' on ledger with did '${did}'`, schema)

      const request = await this.indy.buildSchemaRequest(did, schema)

      const response = await this.submitWriteRequest(request, did)
      this.logger.debug(`Registered schema '${schema.id}' on ledger`, {
        response,
        schema,
      })

      schema.seqNo = response.result.txnMetadata.seqNo

      return schema
    } catch (error) {
      this.logger.error(`Error registering schema for did '${did}' on ledger`, {
        error,
        did,
        poolHandle: await this.getPoolHandle(),
        schema,
      })

      throw error
    }
  }

  public async getSchema(schemaId: SchemaId) {
    try {
      this.logger.debug(`Get schema '${schemaId}' from ledger`)

      const request = await this.indy.buildGetSchemaRequest(null, schemaId)

      this.logger.debug(`Submitting get schema request for schema '${schemaId}' to ledger`)
      const response = await this.submitReadRequest(request)

      const [, schema] = await this.indy.parseGetSchemaResponse(response)
      this.logger.debug(`Got schema '${schemaId}' from ledger`, {
        response,
        schema,
      })

      return schema
    } catch (error) {
      this.logger.error(`Error retrieving schema '${schemaId}' from ledger`, {
        error,
        schemaId,
        poolHandle: await this.getPoolHandle(),
      })

      throw error
    }
  }

  public async registerCredentialDefinition(did: Did, credentialDefinition: Indy.CredDef): Promise<void> {
    try {
      this.logger.debug(
        `Register credential definition '${credentialDefinition.id}' on ledger with did '${did}'`,
        credentialDefinition
      )

      const request = await this.indy.buildCredDefRequest(did, credentialDefinition)

      const response = await this.submitWriteRequest(request, did)

      this.logger.debug(`Registered credential definition '${credentialDefinition.id}' on ledger`, {
        response,
        credentialDefinition,
      })
    } catch (error) {
      this.logger.error(`Error registering credential definition for schema '${credentialDefinition.id}' on ledger`, {
        error,
        did,
        poolHandle: await this.getPoolHandle(),
        credentialDefinition,
      })

      throw error
    }
  }

  public async getCredentialDefinition(credentialDefinitionId: CredDefId) {
    try {
      this.logger.debug(`Get credential definition '${credentialDefinitionId}' from ledger`)

      const request = await this.indy.buildGetCredDefRequest(null, credentialDefinitionId)

      this.logger.debug(
        `Submitting get credential definition request for credential definition '${credentialDefinitionId}' to ledger`
      )
      const response = await this.submitReadRequest(request)

      const [, credentialDefinition] = await this.indy.parseGetCredDefResponse(response)
      this.logger.debug(`Got credential definition '${credentialDefinitionId}' from ledger`, {
        response,
        credentialDefinition,
      })

      return credentialDefinition
    } catch (error) {
      this.logger.error(`Error retrieving credential definition '${credentialDefinitionId}' from ledger`, {
        error,
        credentialDefinitionId,
        poolHandle: await this.getPoolHandle(),
      })
      throw error
    }
  }

  public async registerRevocationRegistry(did: Did, revocationRegistry: RevocRegDef): Promise<void> {
    try {
      this.logger.debug(
        `Register revocation registry '${revocationRegistry.id}' on ledger with did '${did}'`,
        revocationRegistry
      )

      const request = await this.indy.buildRevocRegDefRequest(did, revocationRegistry)

      const response = await this.submitWriteRequest(request, did)

      this.logger.debug(`Registered revocation registry '${revocationRegistry.id}' on ledger`, {
        response,
        revocationRegistry,
      })
    } catch (error) {
      this.logger.error(
        `Error registering revocation registry '${revocationRegistry.id}' on ledger with did '${did}'`,
        {
          error,
          did,
          poolHandle: await this.getPoolHandle(),
          revocationRegistry,
        }
      )

      throw error
    }
  }

  public async getRevocationRegistryDefinition(revocationRegistryId: string): Promise<Indy.RevocRegDef> {
    try {
      this.logger.debug(`Get revocation registry definition '${revocationRegistryId}' from ledger`)

      const request = await this.indy.buildGetRevocRegDefRequest(null, revocationRegistryId)

      this.logger.debug(`Submitting get revocation registry definition request for '${revocationRegistryId}' to ledger`)
      const response = await this.submitReadRequest(request)

      const [, revocationRegistryDefinition] = await this.indy.parseGetRevocRegDefResponse(response)
      this.logger.debug(`Got revocation registry definition '${revocationRegistryId}' from ledger`, {
        response,
        revocationRegistryDefinition,
      })

      return revocationRegistryDefinition
    } catch (error) {
      this.logger.error(`Error retrieving revocation registry definition '${revocationRegistryId}' from ledger`, {
        error,
        revocationRegistryId,
        poolHandle: await this.getPoolHandle(),
      })
      throw error
    }
  }

  private async submitWriteRequest(request: LedgerRequest, signDid: string): Promise<LedgerWriteReplyResponse> {
    const requestWithTaa = await this.appendTaa(request)
    const signedRequestWithTaa = await this.wallet.signRequest(signDid, requestWithTaa)

    const response = await this.indy.submitRequest(await this.getPoolHandle(), signedRequestWithTaa)

    if (response.op === 'REJECT') {
      throw Error(`Ledger rejected transaction request: ${response.reason}`)
    }

    return response as LedgerWriteReplyResponse
  }

  private async submitReadRequest(request: LedgerRequest): Promise<LedgerReadReplyResponse> {
    const response = await this.indy.submitRequest(await this.getPoolHandle(), request)

    if (response.op === 'REJECT') {
      throw Error(`Ledger rejected transaction request: ${response.reason}`)
    }

    return response as LedgerReadReplyResponse
  }

  private async appendTaa(request: LedgerRequest) {
    const authorAgreement = await this.getTransactionAuthorAgreement()

    // If ledger does not have TAA, we can just send request
    if (authorAgreement == null) {
      return request
    }

    const requestWithTaa = await this.indy.appendTxnAuthorAgreementAcceptanceToRequest(
      request,
      authorAgreement.text,
      authorAgreement.version,
      authorAgreement.digest,
      this.getFirstAcceptanceMechanism(authorAgreement),
      // Current time since epoch
      // We can't use ratification_ts, as it must be greater than 1499906902
      Math.floor(new Date().getTime() / 1000)
    )

    return requestWithTaa
  }

  private async getTransactionAuthorAgreement(): Promise<AuthorAgreement | null> {
    // TODO Replace this condition with memoization
    if (this.authorAgreement !== undefined) {
      return this.authorAgreement
    }

    const taaRequest = await this.indy.buildGetTxnAuthorAgreementRequest(null)
    const taaResponse = await this.submitReadRequest(taaRequest)
    const acceptanceMechanismRequest = await this.indy.buildGetAcceptanceMechanismsRequest(null)
    const acceptanceMechanismResponse = await this.submitReadRequest(acceptanceMechanismRequest)

    // TAA can be null
    if (taaResponse.result.data == null) {
      this.authorAgreement = null
      return null
    }

    // If TAA is not null, we can be sure AcceptanceMechanisms is also not null
    const authorAgreement = taaResponse.result.data as AuthorAgreement
    const acceptanceMechanisms = acceptanceMechanismResponse.result.data as AcceptanceMechanisms
    this.authorAgreement = {
      ...authorAgreement,
      acceptanceMechanisms,
    }
    return this.authorAgreement
  }

  private getFirstAcceptanceMechanism(authorAgreement: AuthorAgreement) {
    const [firstMechanism] = Object.keys(authorAgreement.acceptanceMechanisms.aml)
    return firstMechanism
  }

  private async getGenesisPath() {
    // If the path is already provided return it
    if (this.agentConfig.genesisPath) return this.agentConfig.genesisPath

    // Determine the genesisPath
    const genesisPath = `${this.fileSystem.tmpDir}/genesis/genesis-${this.agentConfig.poolName}.txn`
    // Store genesis data if provided
    if (this.agentConfig.genesisTransactions) {
      await this.fileSystem.write(genesisPath, this.agentConfig.genesisTransactions)
      return genesisPath
    }

    // No genesisPath
    return null
  }
}

export interface SchemaTemplate {
  name: string
  version: string
  attributes: string[]
}

export interface CredentialDefinitionTemplate {
  schema: Schema
  tag: string
  signatureType: 'CL'
  supportRevocation: boolean
}

export interface RevocationRegistryTemplate {
  tag: string
  maxNumberOfCreds?: number
  credentialDefinitionId: string
}

interface AuthorAgreement {
  digest: string
  version: string
  text: string
  ratification_ts: number
  acceptanceMechanisms: AcceptanceMechanisms
}

interface AcceptanceMechanisms {
  aml: Record<string, string>
  amlContext: string
  version: string
}
