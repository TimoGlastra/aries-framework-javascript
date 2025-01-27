import type { EncryptedMessage, WalletConfig, WalletCreateKeyOptions, WalletSignOptions, UnpackedMessageContext, WalletVerifyOptions, Wallet, WalletConfigRekey, WalletExportImportConfig, Logger, SigningProviderRegistry, WalletDirectEncryptCompactJwtEcdhEsOptions } from '@credo-ts/core';
import type { Session } from '@hyperledger/aries-askar-shared';
import { Buffer, Key, KeyType } from '@credo-ts/core';
import { Store } from '@hyperledger/aries-askar-shared';
export declare abstract class AskarBaseWallet implements Wallet {
    protected logger: Logger;
    protected signingKeyProviderRegistry: SigningProviderRegistry;
    constructor(logger: Logger, signingKeyProviderRegistry: SigningProviderRegistry);
    /**
     * Abstract methods that need to be implemented by subclasses
     */
    abstract isInitialized: boolean;
    abstract isProvisioned: boolean;
    abstract create(walletConfig: WalletConfig): Promise<void>;
    abstract createAndOpen(walletConfig: WalletConfig): Promise<void>;
    abstract open(walletConfig: WalletConfig): Promise<void>;
    abstract rotateKey(walletConfig: WalletConfigRekey): Promise<void>;
    abstract close(): Promise<void>;
    abstract delete(): Promise<void>;
    abstract export(exportConfig: WalletExportImportConfig): Promise<void>;
    abstract import(walletConfig: WalletConfig, importConfig: WalletExportImportConfig): Promise<void>;
    abstract dispose(): void | Promise<void>;
    abstract profile: string;
    protected abstract store: Store;
    /**
     * Run callback with the session provided, the session will
     * be closed once the callback resolves or rejects if it is not closed yet.
     *
     * TODO: update to new `using` syntax so we don't have to use a callback
     */
    withSession<Return>(callback: (session: Session) => Return): Promise<Awaited<Return>>;
    /**
     * Run callback with a transaction. If the callback resolves the transaction
     * will be committed if the transaction is not closed yet. If the callback rejects
     * the transaction will be rolled back if the transaction is not closed yet.
     *
     * TODO: update to new `using` syntax so we don't have to use a callback
     */
    withTransaction<Return>(callback: (transaction: Session) => Return): Promise<Awaited<Return>>;
    get supportedKeyTypes(): KeyType[];
    /**
     * Create a key with an optional seed and keyType.
     * The keypair is also automatically stored in the wallet afterwards
     */
    createKey({ seed, privateKey, keyType, keyId, keyBackend, }: WalletCreateKeyOptions): Promise<Key>;
    /**
     * sign a Buffer with an instance of a Key class
     *
     * @param data Buffer The data that needs to be signed
     * @param key Key The key that is used to sign the data
     *
     * @returns A signature for the data
     */
    sign({ data, key }: WalletSignOptions): Promise<Buffer>;
    /**
     * Verify the signature with the data and the used key
     *
     * @param data Buffer The data that has to be confirmed to be signed
     * @param key Key The key that was used in the signing process
     * @param signature Buffer The signature that was created by the signing process
     *
     * @returns A boolean whether the signature was created with the supplied data and key
     *
     * @throws {WalletError} When it could not do the verification
     * @throws {WalletError} When an unsupported keytype is used
     */
    verify({ data, key, signature }: WalletVerifyOptions): Promise<boolean>;
    /**
     * Pack a message using DIDComm V1 algorithm
     *
     * @param payload message to send
     * @param recipientKeys array containing recipient keys in base58
     * @param senderVerkey sender key in base58
     * @returns JWE Envelope to send
     */
    pack(payload: Record<string, unknown>, recipientKeys: string[], senderVerkey?: string): Promise<EncryptedMessage>;
    /**
     * Unpacks a JWE Envelope coded using DIDComm V1 algorithm
     *
     * @param messagePackage JWE Envelope
     * @returns UnpackedMessageContext with plain text message, sender key and recipient key
     */
    unpack(messagePackage: EncryptedMessage): Promise<UnpackedMessageContext>;
    /**
     * Method that enables JWE encryption using ECDH-ES and AesA256Gcm and returns it as a compact JWE.
     * This method is specifically added to support OpenID4VP response encryption using JARM and should later be
     * refactored into a more generic method that supports encryption/decryption.
     *
     * @returns compact JWE
     */
    directEncryptCompactJweEcdhEs({ recipientKey, encryptionAlgorithm, apu, apv, data, header, }: WalletDirectEncryptCompactJwtEcdhEsOptions): Promise<string>;
    /**
     * Method that enables JWE decryption using ECDH-ES and AesA256Gcm and returns it as plaintext buffer with the header.
     * The apv and apu values are extracted from the heaader, and thus on a higher level it should be checked that these
     * values are correct.
     */
    directDecryptCompactJweEcdhEs({ compactJwe, recipientKey, }: {
        compactJwe: string;
        recipientKey: Key;
    }): Promise<{
        data: Buffer;
        header: Record<string, unknown>;
    }>;
    generateNonce(): Promise<string>;
    getRandomValues(length: number): Uint8Array;
    generateWalletKey(): Promise<string>;
    private retrieveKeyPair;
    private getSecureEnvironmentKey;
    private deleteKeyPair;
    private storeKeyPair;
    private storeSecureEnvironmentKeyById;
}
