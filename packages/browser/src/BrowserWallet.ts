/* eslint-disable import/no-named-as-default-member */
import type {
  Logger,
  AgentConfig,
  WireMessage,
  UnpackedMessageContext,
  WalletConfig,
  Wallet,
  DidConfig,
  DidInfo,
} from '@aries-framework/core'

import { WalletError, AriesFrameworkError, utils } from '@aries-framework/core'
import { Buffer } from 'buffer/'
import { DIDComm } from 'encryption-envelope-js'
// eslint-disable-next-line import/default
import sodium from 'libsodium-wrappers'
import * as base58 from 'micro-base58'

export class BrowserWallet implements Wallet {
  private logger: Logger
  private publicDidInfo: DidInfo | undefined
  private _didcomm?: DIDComm
  private keyPairs: {
    [verkey: string]: sodium.KeyPair
  } = {}

  public constructor(agentConfig: AgentConfig) {
    this.logger = agentConfig.logger
  }

  public get didcomm() {
    if (!this._didcomm) {
      throw new AriesFrameworkError('Wallet has not been initialized yet')
    }

    return this._didcomm
  }

  public get isInitialized() {
    return this._didcomm !== undefined
  }

  public get publicDid() {
    return this.publicDidInfo
  }

  public async initialize(walletConfig: WalletConfig) {
    this.logger.info(`Initializing InMemoryWallet wallet '${walletConfig.walletId}'`, walletConfig)

    if (this.isInitialized) {
      throw new WalletError(
        'Wallet instance already initialized. Close the currently opened wallet before re-initializing the wallet'
      )
    }

    const didcomm = new DIDComm()
    await didcomm.Ready
    await sodium.ready
    this._didcomm = didcomm

    // TODO: create/open wallet
    // this.create(walletConfig)
    // this.open(walletConfig)

    this.logger.debug(`Wallet '${walletConfig.walletId}' initialized with handle`)
  }

  /**
   * @throws {WalletDuplicateError} if the wallet already exists
   * @throws {WalletError} if another error occurs
   */
  public async create(walletConfig: WalletConfig): Promise<void> {
    this.logger.debug(`Creating wallet '${walletConfig.walletId}'`)
  }

  /**
   * @throws {WalletNotFoundError} if the wallet does not exist
   * @throws {WalletError} if another error occurs
   */
  public async open(walletConfig: WalletConfig): Promise<void> {
    if (this.isInitialized) {
      throw new WalletError(
        'Wallet instance already initialized. Close the currently opened wallet before re-initializing the wallet'
      )
    }

    // TODO: open wallet
  }

  /**
   * @throws {WalletNotFoundError} if the wallet does not exist
   * @throws {WalletError} if another error occurs
   */
  public async delete(): Promise<void> {
    if (!this.isInitialized) {
      throw new WalletError(
        'Can not delete wallet that is not initialized. Make sure to call initialize before deleting the wallet'
      )
    }

    this.logger.info(`Deleting wallet`)

    await this.close()
    // TODO: delete wallet
  }

  /**
   * @throws {WalletError} if the wallet is already closed or another error occurs
   */
  public async close(): Promise<void> {
    // TODO: close wallet
  }

  public async initPublicDid(didConfig: DidConfig) {
    const { did, verkey } = await this.createDid(didConfig)
    this.publicDidInfo = {
      did,
      verkey,
    }
  }

  public async createDid(didConfig?: DidConfig): Promise<DidInfo> {
    try {
      const finalSeed = didConfig?.seed
        ? Buffer.from(didConfig.seed)
        : sodium.randombytes_buf(sodium.crypto_box_SEEDBYTES)

      const keyPair = sodium.crypto_sign_seed_keypair(finalSeed)

      const did = base58.encode(Buffer.from(keyPair.publicKey.subarray(0, 16)))
      const verkey = base58.encode(Buffer.from(keyPair.publicKey))

      this.keyPairs[verkey] = keyPair

      return { did, verkey }
    } catch (error) {
      throw new WalletError(`Error creating Did: ${error.message}`, { cause: error })
    }
  }

  public async pack(
    payload: Record<string, unknown>,
    recipientKeys: string[],
    senderVerkey?: string | null
  ): Promise<WireMessage> {
    try {
      const messageRaw = utils.JsonEncoder.toString(payload)
      const packedMessage = await this.didcomm.packMessage(
        messageRaw,
        recipientKeys.map((r) => base58.decode(r)),
        senderVerkey ? this.keyPairs[senderVerkey] : null
      )
      return utils.JsonEncoder.fromString(packedMessage)
    } catch (error) {
      throw new WalletError('Error packing message', { cause: error })
    }
  }

  public async unpack(messagePackage: WireMessage): Promise<UnpackedMessageContext> {
    try {
      const recipientsOuter = utils.JsonEncoder.fromBase64(messagePackage.protected as string)
      const recipientKeys = recipientsOuter.recipients.map((r: any) => r.header.kid) as string[]

      const foundRecipientKey = recipientKeys.find((r) => this.keyPairs[r] !== undefined)

      if (!foundRecipientKey) {
        throw new WalletError(`Unable to unpack message. No key for recipient keys ${recipientKeys}`)
      }

      const { senderKey, message, recipientKey } = await this.didcomm.unpackMessage(
        JSON.stringify(messagePackage),
        this.keyPairs[foundRecipientKey]
      )

      return {
        senderVerkey: senderKey,
        recipientVerkey: recipientKey,
        message: utils.JsonEncoder.fromString(message),
      }
    } catch (error) {
      throw new WalletError('Error unpacking message', { cause: error })
    }
  }

  public async sign(data: Buffer, verkey: string): Promise<Buffer> {
    const keyPair = this.keyPairs[verkey]

    if (!keyPair) {
      throw new WalletError('Unable to sign. No key pair found for verkey')
    }

    const result = sodium.crypto_sign(data, keyPair.privateKey)

    return Buffer.from(result.subarray(0, sodium.crypto_sign_BYTES))
  }

  public async verify(signerVerkey: string, data: Buffer, signature: Buffer): Promise<boolean> {
    try {
      sodium.crypto_sign_open(Buffer.concat([signature, data]), base58.decode(signerVerkey))
      return true
    } catch (error) {
      return false
    }
  }

  public async generateNonce() {
    try {
      return Buffer.from(sodium.randombytes_buf(32)).toString()
    } catch (error) {
      throw new WalletError('Error generating nonce', { cause: error })
    }
  }
}
