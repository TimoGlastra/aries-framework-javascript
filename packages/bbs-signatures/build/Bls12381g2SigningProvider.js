"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bls12381g2SigningProvider = void 0;
const core_1 = require("@credo-ts/core");
const bbs_signatures_1 = require("@mattrglobal/bbs-signatures");
/**
 * This will be extracted to the bbs package.
 */
let Bls12381g2SigningProvider = class Bls12381g2SigningProvider {
    constructor() {
        this.keyType = core_1.KeyType.Bls12381g2;
    }
    /**
     * Create a KeyPair with type Bls12381g2
     *
     * @throws {SigningProviderError} When a key could not be created
     */
    async createKeyPair({ seed, privateKey }) {
        if (privateKey) {
            throw new core_1.SigningProviderError('Cannot create keypair from private key');
        }
        const blsKeyPair = await (0, bbs_signatures_1.generateBls12381G2KeyPair)(seed);
        return {
            keyType: core_1.KeyType.Bls12381g2,
            publicKeyBase58: core_1.TypedArrayEncoder.toBase58(blsKeyPair.publicKey),
            privateKeyBase58: core_1.TypedArrayEncoder.toBase58(blsKeyPair.secretKey),
        };
    }
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
    async sign({ data, publicKeyBase58, privateKeyBase58 }) {
        if (data.length === 0)
            throw new core_1.SigningProviderError('Unable to create a signature without any messages');
        // Check if it is a single message or list and if it is a single message convert it to a list
        const normalizedMessages = (core_1.TypedArrayEncoder.isTypedArray(data) ? [data] : data);
        // Get the Uint8Array variant of all the messages
        const messageBuffers = normalizedMessages.map((m) => Uint8Array.from(m));
        const publicKey = core_1.TypedArrayEncoder.fromBase58(publicKeyBase58);
        const privateKey = core_1.TypedArrayEncoder.fromBase58(privateKeyBase58);
        const bbsKeyPair = await (0, bbs_signatures_1.bls12381toBbs)({
            keyPair: { publicKey: Uint8Array.from(publicKey), secretKey: Uint8Array.from(privateKey) },
            messageCount: normalizedMessages.length,
        });
        // Sign the messages via the keyPair
        const signature = await (0, bbs_signatures_1.sign)({
            keyPair: bbsKeyPair,
            messages: messageBuffers,
        });
        // Convert the Uint8Array signature to a Buffer type
        return core_1.Buffer.from(signature);
    }
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
    async verify({ data, publicKeyBase58, signature }) {
        if (data.length === 0)
            throw new core_1.SigningProviderError('Unable to create a signature without any messages');
        // Check if it is a single message or list and if it is a single message convert it to a list
        const normalizedMessages = (core_1.TypedArrayEncoder.isTypedArray(data) ? [data] : data);
        const publicKey = core_1.TypedArrayEncoder.fromBase58(publicKeyBase58);
        // Get the Uint8Array variant of all the messages
        const messageBuffers = normalizedMessages.map((m) => Uint8Array.from(m));
        const bbsKeyPair = await (0, bbs_signatures_1.bls12381toBbs)({
            keyPair: { publicKey: Uint8Array.from(publicKey) },
            messageCount: normalizedMessages.length,
        });
        // Verify the signature against the messages with their public key
        const { verified, error } = await (0, bbs_signatures_1.verify)({ signature, messages: messageBuffers, publicKey: bbsKeyPair.publicKey });
        // If the messages could not be verified and an error occurred
        if (!verified && error) {
            throw new core_1.SigningProviderError(`Could not verify the signature against the messages: ${error}`);
        }
        return verified;
    }
};
exports.Bls12381g2SigningProvider = Bls12381g2SigningProvider;
exports.Bls12381g2SigningProvider = Bls12381g2SigningProvider = __decorate([
    (0, core_1.injectable)()
], Bls12381g2SigningProvider);
//# sourceMappingURL=Bls12381g2SigningProvider.js.map