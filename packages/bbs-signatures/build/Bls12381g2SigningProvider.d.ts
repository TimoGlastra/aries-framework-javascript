import type { SigningProvider, CreateKeyPairOptions, KeyPair, SignOptions, VerifyOptions } from '@credo-ts/core';
import { KeyType, Buffer } from '@credo-ts/core';
/**
 * This will be extracted to the bbs package.
 */
export declare class Bls12381g2SigningProvider implements SigningProvider {
    readonly keyType = KeyType.Bls12381g2;
    /**
     * Create a KeyPair with type Bls12381g2
     *
     * @throws {SigningProviderError} When a key could not be created
     */
    createKeyPair({ seed, privateKey }: CreateKeyPairOptions): Promise<KeyPair>;
    /**
     * Sign an arbitrary amount of messages, in byte form, with a keypair
     *
     * @param messages Buffer[] List of messages in Buffer form
     * @param publicKey Buffer Publickey required for the signing process
     * @param privateKey Buffer PrivateKey required for the signing process
     *
     * @returns A Buffer containing the signature of the messages
     *
     * @throws {SigningProviderError} When there are no supplied messages
     */
    sign({ data, publicKeyBase58, privateKeyBase58 }: SignOptions): Promise<Buffer>;
    /**
     * Verify an arbitrary amount of messages with their signature created with their key pair
     *
     * @param publicKey Buffer The public key used to sign the messages
     * @param messages Buffer[] The messages that have to be verified if they are signed
     * @param signature Buffer The signature that has to be verified if it was created with the messages and public key
     *
     * @returns A boolean whether the signature is create with the public key over the messages
     *
     * @throws {SigningProviderError} When the message list is empty
     * @throws {SigningProviderError} When the verification process failed
     */
    verify({ data, publicKeyBase58, signature }: VerifyOptions): Promise<boolean>;
}
