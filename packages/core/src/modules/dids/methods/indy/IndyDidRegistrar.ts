import type { AgentConfig } from '../../../../agent/AgentConfig'
import type { IndyWallet } from '../../../../wallet/IndyWallet'
import type { IndyLedgerService } from '../../../ledger'
import type { DidRegistrar } from '../../domain/DidRegistrar'
import type { DidRepository } from '../../repository'
import type { DidCreateOptions, DidCreateResult, DidDeactivateResult, DidUpdateResult } from '../../types'
import type * as Indy from 'indy-sdk'

import { KeyType } from '../../../../crypto'
import { DidDocumentBuilder } from '../../domain'
import { DidDocumentRole } from '../../domain/DidDocumentRole'
import { DidError } from '../../error/DidError'
import { DidOperationNotSupported } from '../../error/DidOperationNotSupported'
import { DidRecord } from '../../repository'

export class IndyDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['sov']
  private wallet: IndyWallet
  private didRepository: DidRepository
  private indy: typeof Indy
  private indyLedgerService: IndyLedgerService

  public constructor(
    wallet: IndyWallet,
    didRepository: DidRepository,
    agentConfig: AgentConfig,
    indyLedgerService: IndyLedgerService
  ) {
    this.wallet = wallet
    this.didRepository = didRepository
    this.indy = agentConfig.agentDependencies.indy
    this.indyLedgerService = indyLedgerService
  }

  public async create(options: SovDidCreateOptions): Promise<DidCreateResult> {
    const { keyType, alias, role, submitterDid } = options.options
    const seed = options.secret?.seed

    if (seed && (typeof seed !== 'string' || seed.length !== 32)) {
      throw new DidError('Invalid seed provided')
    }

    if (keyType != KeyType.Ed25519) {
      throw new DidError('Unsupported key type for did method: sov')
    }

    // NOTE: we need to sue the createAndStoreMyDid method from indy to create the did
    // If we just create a key and handle the creating of the did ourselves, indy will throw a
    // WalletItemNotFound when it needs to sign ledger transactions using this did. This means we need
    // to rely directly on the indy SDK, as we don't want to expose a createDid method just for.
    // FIXME: once askar/indy-vdr is supported we need to adjust this to work with both indy-sdk and askar
    const [indyDid, verkey] = await this.indy.createAndStoreMyDid(this.wallet.handle, {
      seed,
    })

    const fullDid = `did:sov:${indyDid}`

    if (!submitterDid.startsWith('did:sov:')) {
      throw new Error('Submitter did must a valid did:sov did')
    }

    await this.indyLedgerService.registerPublicDid(submitterDid.replace('did:sov:', ''), indyDid, verkey, alias, role)

    // Save the did so we know we created it and can issue with it
    // TODO: should we make this an optional configuration to save created dids?
    // TODO: extract the recipientKeys from the services
    const didRecord = new DidRecord({
      id: fullDid,
      role: DidDocumentRole.Created,
    })
    await this.didRepository.save(didRecord)

    // FIXME: get / build the did document
    const didDocument = new DidDocumentBuilder(fullDid).build()

    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: 'finished',
        did: fullDid,
        didDocument,
        secret: {
          // FIXME: the uniregistrar creates the seed in the registrar method
          // if it doesn't exist so the seed can always be returned. Currently
          // we can only return it if the seed was passed in by the user. Once
          // we have a secure method for generating seeds we should use the same
          // approach
          seed: options.secret?.seed,
        },
      },
    }
  }

  public update(): Promise<DidUpdateResult> {
    throw new DidOperationNotSupported('Cannot update did:key did')
  }

  public deactivate(): Promise<DidDeactivateResult> {
    throw new DidOperationNotSupported('Cannot deactivate did:key did')
  }
}

export interface SovDidCreateOptions extends DidCreateOptions {
  method: 'sov'
  did?: undefined
  // TODO: support setting services
  didDocument?: undefined
  options: {
    keyType: KeyType.Ed25519
    alias: string
    role?: Indy.NymRole
    submitterDid: string
  }
  secret?: {
    seed?: string
  }
}

// Update and Deactivate not supported for did:sov
export type IndyDidUpdateOptions = never
export type IndyDidDeactivateOptions = never
