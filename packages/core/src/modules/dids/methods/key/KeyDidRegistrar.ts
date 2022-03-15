import type { KeyType } from '../../../../crypto'
import type { Wallet } from '../../../../wallet/Wallet'
import type { DidRegistrar } from '../../domain/DidRegistrar'
import type { DidRepository } from '../../repository'
import type { DidCreateOptions, DidCreateResult, DidDeactivateResult, DidUpdateResult } from '../../types'

import { DidDocumentRole } from '../../domain/DidDocumentRole'
import { DidError } from '../../error/DidError'
import { DidOperationNotSupported } from '../../error/DidOperationNotSupported'
import { DidRecord } from '../../repository'

import { DidKey } from './DidKey'

export class KeyDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['key']
  private wallet: Wallet
  private didRepository: DidRepository

  public constructor(wallet: Wallet, didRepository: DidRepository) {
    this.wallet = wallet
    this.didRepository = didRepository
  }

  public async create(options: KeyDidCreateOptions): Promise<DidCreateResult> {
    const keyType = options.options.keyType
    const seed = options.secret?.seed

    if (seed && (typeof seed !== 'string' || seed.length !== 32)) {
      throw new DidError('Invalid seed provided')
    }

    const key = await this.wallet.createKey({
      keyType,
      seed,
    })

    const didKey = new DidKey(key)

    // Save the did so we know we created it and can issue with it
    // TODO: should we make this an optional configuration to save created dids?
    const didRecord = new DidRecord({
      id: didKey.did,
      role: DidDocumentRole.Created,
    })
    await this.didRepository.save(didRecord)

    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: 'finished',
        did: didKey.did,
        didDocument: didKey.didDocument,
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

export interface KeyDidCreateOptions extends DidCreateOptions {
  method: 'key'
  did?: undefined
  didDocument?: undefined
  options: {
    keyType: KeyType.Ed25519
  }
  secret?: {
    seed?: string
  }
}

// Update and Deactivate not supported for did:key
export type KeyDidUpdateOptions = never
export type KeyDidDeactivateOptions = never
