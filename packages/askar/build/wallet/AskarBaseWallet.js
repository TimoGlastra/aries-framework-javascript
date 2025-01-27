"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarBaseWallet = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const bn_js_1 = __importDefault(require("bn.js"));
const secureEnvironment_1 = require("../secureEnvironment");
const utils_1 = require("../utils");
const didcommV1_1 = require("./didcommV1");
const isError = (error) => error instanceof Error;
class AskarBaseWallet {
    constructor(logger, signingKeyProviderRegistry) {
        this.logger = logger;
        this.signingKeyProviderRegistry = signingKeyProviderRegistry;
    }
    /**
     * Run callback with the session provided, the session will
     * be closed once the callback resolves or rejects if it is not closed yet.
     *
     * TODO: update to new `using` syntax so we don't have to use a callback
     */
    async withSession(callback) {
        let session = undefined;
        try {
            session = await this.store.session(this.profile).open();
            const result = await callback(session);
            return result;
        }
        finally {
            if (session === null || session === void 0 ? void 0 : session.handle) {
                await session.close();
            }
        }
    }
    /**
     * Run callback with a transaction. If the callback resolves the transaction
     * will be committed if the transaction is not closed yet. If the callback rejects
     * the transaction will be rolled back if the transaction is not closed yet.
     *
     * TODO: update to new `using` syntax so we don't have to use a callback
     */
    async withTransaction(callback) {
        let session = undefined;
        try {
            session = await this.store.transaction(this.profile).open();
            const result = await callback(session);
            if (session.handle) {
                await session.commit();
            }
            return result;
        }
        catch (error) {
            if (session === null || session === void 0 ? void 0 : session.handle) {
                await (session === null || session === void 0 ? void 0 : session.rollback());
            }
            throw error;
        }
    }
    get supportedKeyTypes() {
        const signingKeyProviderSupportedKeyTypes = this.signingKeyProviderRegistry.supportedKeyTypes;
        return Array.from(new Set([...utils_1.keyTypesSupportedByAskar, ...signingKeyProviderSupportedKeyTypes]));
    }
    /**
     * Create a key with an optional seed and keyType.
     * The keypair is also automatically stored in the wallet afterwards
     */
    async createKey({ seed, privateKey, keyType, keyId, keyBackend = core_1.KeyBackend.Software, }) {
        try {
            if (seed && privateKey) {
                throw new core_1.WalletError('Only one of seed and privateKey can be set');
            }
            if (seed && !(0, core_1.isValidSeed)(seed, keyType)) {
                throw new core_1.WalletError('Invalid seed provided');
            }
            if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, keyType)) {
                throw new core_1.WalletError('Invalid private key provided');
            }
            if (keyBackend === core_1.KeyBackend.SecureElement && keyType !== core_1.KeyType.P256) {
                throw new core_1.WalletError(`Keytype '${keyType}' is not supported for the secure element`);
            }
            if ((0, utils_1.isKeyTypeSupportedByAskarForPurpose)(keyType, utils_1.AskarKeyTypePurpose.KeyManagement) &&
                keyBackend === core_1.KeyBackend.Software) {
                const algorithm = (0, aries_askar_shared_1.keyAlgFromString)(keyType);
                // Create key
                let key;
                try {
                    const _key = privateKey
                        ? aries_askar_shared_1.Key.fromSecretBytes({ secretKey: privateKey, algorithm })
                        : seed
                            ? aries_askar_shared_1.Key.fromSeed({ seed, algorithm })
                            : aries_askar_shared_1.Key.generate(algorithm);
                    // FIXME: we need to create a separate const '_key' so TS definitely knows _key is defined in the session callback.
                    // This will be fixed once we use the new 'using' syntax
                    key = _key;
                    const keyPublicBytes = key.publicBytes;
                    // Store key
                    await this.withSession((session) => session.insertKey({ key: _key, name: keyId !== null && keyId !== void 0 ? keyId : core_1.TypedArrayEncoder.toBase58(keyPublicBytes) }));
                    key.handle.free();
                    return core_1.Key.fromPublicKey(keyPublicBytes, keyType);
                }
                catch (error) {
                    key === null || key === void 0 ? void 0 : key.handle.free();
                    // Handle case where key already exists
                    if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                        throw new core_1.WalletKeyExistsError('Key already exists');
                    }
                    // Otherwise re-throw error
                    throw error;
                }
            }
            else if (keyBackend === core_1.KeyBackend.SecureElement && keyType === core_1.KeyType.P256) {
                const secureEnvironment = (0, secureEnvironment_1.importSecureEnvironment)();
                const kid = core_1.utils.uuid();
                // Generate a hardware-backed P-256 keypair
                await secureEnvironment.generateKeypair(kid);
                const publicKeyBytes = await secureEnvironment.getPublicBytesForKeyId(kid);
                const publicKeyBase58 = core_1.TypedArrayEncoder.toBase58(publicKeyBytes);
                await this.storeSecureEnvironmentKeyById({
                    keyType,
                    publicKeyBase58,
                    keyId: kid,
                });
                return new core_1.Key(publicKeyBytes, keyType);
            }
            else {
                // Check if there is a signing key provider for the specified key type.
                if (this.signingKeyProviderRegistry.hasProviderForKeyType(keyType)) {
                    const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(keyType);
                    const keyPair = await signingKeyProvider.createKeyPair({ seed, privateKey });
                    await this.storeKeyPair(keyPair);
                    return core_1.Key.fromPublicKeyBase58(keyPair.publicKeyBase58, keyType);
                }
                throw new core_1.WalletError(`Unsupported key type: '${keyType}'`);
            }
        }
        catch (error) {
            // If already instance of `WalletError`, re-throw
            if (error instanceof core_1.WalletError)
                throw error;
            if (!isError(error)) {
                throw new core_1.CredoError('Attempted to throw error, but it was not of type Error', { cause: error });
            }
            throw new core_1.WalletError(`Error creating key with key type '${keyType}': ${error.message}`, { cause: error });
        }
    }
    /**
     * sign a Buffer with an instance of a Key class
     *
     * @param data Buffer The data that needs to be signed
     * @param key Key The key that is used to sign the data
     *
     * @returns A signature for the data
     */
    async sign({ data, key }) {
        var _a;
        let askarKey;
        let keyPair;
        try {
            if ((0, utils_1.isKeyTypeSupportedByAskarForPurpose)(key.keyType, utils_1.AskarKeyTypePurpose.KeyManagement)) {
                askarKey = await this.withSession(async (session) => { var _a; return (_a = (await session.fetchKey({ name: key.publicKeyBase58 }))) === null || _a === void 0 ? void 0 : _a.key; });
            }
            // FIXME: remove the custom KeyPair record now that we deprecate Indy SDK.
            // We can do this in a migration script
            // Fallback to fetching key from the non-askar storage, this is to handle the case
            // where a key wasn't supported at first by the wallet, but now is
            if (!askarKey) {
                // TODO: we should probably make retrieveKeyPair + insertKey + deleteKeyPair a transaction
                keyPair = await this.retrieveKeyPair(key.publicKeyBase58);
                // If we have the key stored in a custom record, but it is now supported by Askar,
                // we 'import' the key into askar storage and remove the custom key record
                if (keyPair && (0, utils_1.isKeyTypeSupportedByAskarForPurpose)(keyPair.keyType, utils_1.AskarKeyTypePurpose.KeyManagement)) {
                    const _askarKey = aries_askar_shared_1.Key.fromSecretBytes({
                        secretKey: core_1.TypedArrayEncoder.fromBase58(keyPair.privateKeyBase58),
                        algorithm: (0, aries_askar_shared_1.keyAlgFromString)(keyPair.keyType),
                    });
                    askarKey = _askarKey;
                    await this.withSession((session) => session.insertKey({
                        name: key.publicKeyBase58,
                        key: _askarKey,
                    }));
                    // Now we can remove it from the custom record as we have imported it into Askar
                    await this.deleteKeyPair(key.publicKeyBase58);
                    keyPair = undefined;
                }
                else {
                    const { keyId } = await this.getSecureEnvironmentKey(key.publicKeyBase58);
                    if (Array.isArray(data[0])) {
                        throw new core_1.WalletError('Multi signature is not supported for the Secure Environment');
                    }
                    return core_1.Buffer.from(await (0, secureEnvironment_1.importSecureEnvironment)().sign(keyId, new Uint8Array(data)));
                }
            }
            if (!askarKey && !keyPair) {
                throw new core_1.WalletError('Key entry not found');
            }
            // Not all keys are supported for signing
            if ((0, utils_1.isKeyTypeSupportedByAskarForPurpose)(key.keyType, utils_1.AskarKeyTypePurpose.Signing)) {
                if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                    throw new core_1.WalletError(`Currently not supporting signing of multiple messages`);
                }
                askarKey =
                    askarKey !== null && askarKey !== void 0 ? askarKey : (keyPair
                        ? aries_askar_shared_1.Key.fromSecretBytes({
                            secretKey: core_1.TypedArrayEncoder.fromBase58(keyPair.privateKeyBase58),
                            algorithm: (0, aries_askar_shared_1.keyAlgFromString)(keyPair.keyType),
                        })
                        : undefined);
                if (!askarKey) {
                    throw new core_1.WalletError('Key entry not found');
                }
                const signed = askarKey.signMessage({ message: data });
                return core_1.Buffer.from(signed);
            }
            else {
                // Check if there is a signing key provider for the specified key type.
                if (this.signingKeyProviderRegistry.hasProviderForKeyType(key.keyType)) {
                    const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(key.keyType);
                    // It could be that askar supports storing the key, but can't sign with it
                    // (in case of bls)
                    const privateKeyBase58 = (_a = keyPair === null || keyPair === void 0 ? void 0 : keyPair.privateKeyBase58) !== null && _a !== void 0 ? _a : ((askarKey === null || askarKey === void 0 ? void 0 : askarKey.secretBytes) ? core_1.TypedArrayEncoder.toBase58(askarKey.secretBytes) : undefined);
                    if (!privateKeyBase58) {
                        throw new core_1.WalletError('Key entry not found');
                    }
                    const signed = await signingKeyProvider.sign({
                        data,
                        privateKeyBase58: privateKeyBase58,
                        publicKeyBase58: key.publicKeyBase58,
                    });
                    return signed;
                }
                throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
            }
        }
        catch (error) {
            if (!isError(error)) {
                throw new core_1.CredoError('Attempted to throw error, but it was not of type Error', { cause: error });
            }
            throw new core_1.WalletError(`Error signing data with verkey ${key.publicKeyBase58}. ${error.message}`, { cause: error });
        }
        finally {
            askarKey === null || askarKey === void 0 ? void 0 : askarKey.handle.free();
        }
    }
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
    async verify({ data, key, signature }) {
        let askarKey;
        try {
            if ((0, utils_1.isKeyTypeSupportedByAskarForPurpose)(key.keyType, utils_1.AskarKeyTypePurpose.Signing)) {
                if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                    throw new core_1.WalletError(`Currently not supporting verification of multiple messages`);
                }
                askarKey = aries_askar_shared_1.Key.fromPublicBytes({
                    algorithm: (0, aries_askar_shared_1.keyAlgFromString)(key.keyType),
                    publicKey: key.publicKey,
                });
                const verified = askarKey.verifySignature({ message: data, signature });
                askarKey.handle.free();
                return verified;
            }
            else if (this.signingKeyProviderRegistry.hasProviderForKeyType(key.keyType)) {
                // Check if there is a signing key provider for the specified key type.
                const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(key.keyType);
                const signed = await signingKeyProvider.verify({
                    data,
                    signature,
                    publicKeyBase58: key.publicKeyBase58,
                });
                return signed;
            }
            else {
                throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
            }
        }
        catch (error) {
            askarKey === null || askarKey === void 0 ? void 0 : askarKey.handle.free();
            if (!isError(error)) {
                throw new core_1.CredoError('Attempted to throw error, but it was not of type Error', { cause: error });
            }
            throw new core_1.WalletError(`Error verifying signature of data signed with verkey ${key.publicKeyBase58}`, {
                cause: error,
            });
        }
    }
    /**
     * Pack a message using DIDComm V1 algorithm
     *
     * @param payload message to send
     * @param recipientKeys array containing recipient keys in base58
     * @param senderVerkey sender key in base58
     * @returns JWE Envelope to send
     */
    async pack(payload, recipientKeys, senderVerkey // in base58
    ) {
        const senderKey = senderVerkey
            ? await this.withSession((session) => session.fetchKey({ name: senderVerkey }))
            : undefined;
        try {
            if (senderVerkey && !senderKey) {
                throw new core_1.WalletError(`Sender key not found`);
            }
            const envelope = (0, didcommV1_1.didcommV1Pack)(payload, recipientKeys, senderKey === null || senderKey === void 0 ? void 0 : senderKey.key);
            return envelope;
        }
        finally {
            senderKey === null || senderKey === void 0 ? void 0 : senderKey.key.handle.free();
        }
    }
    /**
     * Unpacks a JWE Envelope coded using DIDComm V1 algorithm
     *
     * @param messagePackage JWE Envelope
     * @returns UnpackedMessageContext with plain text message, sender key and recipient key
     */
    async unpack(messagePackage) {
        const protectedJson = core_1.JsonEncoder.fromBase64(messagePackage.protected);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recipientKids = protectedJson.recipients.map((r) => r.header.kid);
        // TODO: how long should sessions last? Just for the duration of the unpack? Or should each item in the recipientKids get a separate session?
        const returnValue = await this.withSession(async (session) => {
            for (const recipientKid of recipientKids) {
                const recipientKeyEntry = await session.fetchKey({ name: recipientKid });
                try {
                    if (recipientKeyEntry) {
                        return (0, didcommV1_1.didcommV1Unpack)(messagePackage, recipientKeyEntry.key);
                    }
                }
                finally {
                    recipientKeyEntry === null || recipientKeyEntry === void 0 ? void 0 : recipientKeyEntry.key.handle.free();
                }
            }
        });
        if (!returnValue) {
            throw new core_1.WalletError('No corresponding recipient key found');
        }
        return returnValue;
    }
    /**
     * Method that enables JWE encryption using ECDH-ES and AesA256Gcm and returns it as a compact JWE.
     * This method is specifically added to support OpenID4VP response encryption using JARM and should later be
     * refactored into a more generic method that supports encryption/decryption.
     *
     * @returns compact JWE
     */
    async directEncryptCompactJweEcdhEs({ recipientKey, encryptionAlgorithm, apu, apv, data, header, }) {
        if (encryptionAlgorithm !== 'A256GCM') {
            throw new core_1.WalletError(`Encryption algorithm ${encryptionAlgorithm} is not supported. Only A256GCM is supported`);
        }
        // Only one supported for now
        const encAlg = aries_askar_shared_1.KeyAlgs.AesA256Gcm;
        // Create ephemeral key
        const ephemeralKey = aries_askar_shared_1.Key.generate((0, aries_askar_shared_1.keyAlgFromString)(recipientKey.keyType));
        const _header = Object.assign(Object.assign({}, header), { apv,
            apu, enc: 'A256GCM', alg: 'ECDH-ES', epk: ephemeralKey.jwkPublic });
        const encodedHeader = core_1.JsonEncoder.toBase64URL(_header);
        const ecdh = new aries_askar_shared_1.EcdhEs({
            algId: Uint8Array.from(core_1.Buffer.from(encryptionAlgorithm)),
            apu: apu ? Uint8Array.from(core_1.TypedArrayEncoder.fromBase64(apu)) : Uint8Array.from([]),
            apv: apv ? Uint8Array.from(core_1.TypedArrayEncoder.fromBase64(apv)) : Uint8Array.from([]),
        });
        const { ciphertext, tag, nonce } = ecdh.encryptDirect({
            encAlg,
            ephemeralKey,
            message: Uint8Array.from(data),
            recipientKey: aries_askar_shared_1.Key.fromPublicBytes({
                algorithm: (0, aries_askar_shared_1.keyAlgFromString)(recipientKey.keyType),
                publicKey: recipientKey.publicKey,
            }),
            // NOTE: aad is bytes of base64url encoded string. It SHOULD NOT be decoded as base64
            aad: Uint8Array.from(core_1.Buffer.from(encodedHeader)),
        });
        const compactJwe = `${encodedHeader}..${core_1.TypedArrayEncoder.toBase64URL(nonce)}.${core_1.TypedArrayEncoder.toBase64URL(ciphertext)}.${core_1.TypedArrayEncoder.toBase64URL(tag)}`;
        return compactJwe;
    }
    /**
     * Method that enables JWE decryption using ECDH-ES and AesA256Gcm and returns it as plaintext buffer with the header.
     * The apv and apu values are extracted from the heaader, and thus on a higher level it should be checked that these
     * values are correct.
     */
    async directDecryptCompactJweEcdhEs({ compactJwe, recipientKey, }) {
        // encryption key is not used (we don't use key wrapping)
        const [encodedHeader /* encryptionKey */, , encodedIv, encodedCiphertext, encodedTag] = compactJwe.split('.');
        const header = core_1.JsonEncoder.fromBase64(encodedHeader);
        if (header.alg !== 'ECDH-ES') {
            throw new core_1.WalletError('Only ECDH-ES alg value is supported');
        }
        if (header.enc !== 'A256GCM') {
            throw new core_1.WalletError('Only A256GCM enc value is supported');
        }
        if (!header.epk || typeof header.epk !== 'object') {
            throw new core_1.WalletError('header epk value must contain a JWK');
        }
        // NOTE: we don't support custom key storage record at the moment.
        let askarKey;
        if ((0, utils_1.isKeyTypeSupportedByAskarForPurpose)(recipientKey.keyType, utils_1.AskarKeyTypePurpose.KeyManagement)) {
            askarKey = await this.withSession(async (session) => { var _a; return (_a = (await session.fetchKey({ name: recipientKey.publicKeyBase58 }))) === null || _a === void 0 ? void 0 : _a.key; });
        }
        if (!askarKey) {
            throw new core_1.WalletError('Key entry not found');
        }
        // Only one supported for now
        const encAlg = aries_askar_shared_1.KeyAlgs.AesA256Gcm;
        const ecdh = new aries_askar_shared_1.EcdhEs({
            algId: Uint8Array.from(core_1.Buffer.from(header.enc)),
            apu: header.apu ? Uint8Array.from(core_1.TypedArrayEncoder.fromBase64(header.apu)) : Uint8Array.from([]),
            apv: header.apv ? Uint8Array.from(core_1.TypedArrayEncoder.fromBase64(header.apv)) : Uint8Array.from([]),
        });
        const plaintext = ecdh.decryptDirect({
            nonce: core_1.TypedArrayEncoder.fromBase64(encodedIv),
            ciphertext: core_1.TypedArrayEncoder.fromBase64(encodedCiphertext),
            encAlg,
            ephemeralKey: aries_askar_shared_1.Jwk.fromJson(header.epk),
            recipientKey: askarKey,
            tag: core_1.TypedArrayEncoder.fromBase64(encodedTag),
            // NOTE: aad is bytes of base64url encoded string. It SHOULD NOT be decoded as base64
            aad: core_1.TypedArrayEncoder.fromString(encodedHeader),
        });
        return { data: core_1.Buffer.from(plaintext), header };
    }
    async generateNonce() {
        try {
            // generate an 80-bit nonce suitable for AnonCreds proofs
            const nonce = aries_askar_shared_1.CryptoBox.randomNonce().slice(0, 10);
            return new bn_js_1.default(nonce).toString();
        }
        catch (error) {
            if (!isError(error)) {
                throw new core_1.CredoError('Attempted to throw error, but it was not of type Error', { cause: error });
            }
            throw new core_1.WalletError('Error generating nonce', { cause: error });
        }
    }
    getRandomValues(length) {
        try {
            const buffer = new Uint8Array(length);
            const CBOX_NONCE_LENGTH = 24;
            const genCount = Math.ceil(length / CBOX_NONCE_LENGTH);
            const buf = new Uint8Array(genCount * CBOX_NONCE_LENGTH);
            for (let i = 0; i < genCount; i++) {
                const randomBytes = aries_askar_shared_1.CryptoBox.randomNonce();
                buf.set(randomBytes, CBOX_NONCE_LENGTH * i);
            }
            buffer.set(buf.subarray(0, length));
            return buffer;
        }
        catch (error) {
            if (!isError(error)) {
                throw new core_1.CredoError('Attempted to throw error, but it was not of type Error', { cause: error });
            }
            throw new core_1.WalletError('Error generating nonce', { cause: error });
        }
    }
    async generateWalletKey() {
        try {
            return aries_askar_shared_1.Store.generateRawKey();
        }
        catch (error) {
            throw new core_1.WalletError('Error generating wallet key', { cause: error });
        }
    }
    async retrieveKeyPair(publicKeyBase58) {
        try {
            const entryObject = await this.withSession((session) => session.fetch({ category: 'KeyPairRecord', name: `key-${publicKeyBase58}` }));
            if (!entryObject)
                return null;
            return core_1.JsonEncoder.fromString(entryObject === null || entryObject === void 0 ? void 0 : entryObject.value);
        }
        catch (error) {
            throw new core_1.WalletError('Error retrieving KeyPair record', { cause: error });
        }
    }
    async getSecureEnvironmentKey(keyId) {
        try {
            const entryObject = await this.withSession((session) => session.fetch({ category: 'SecureEnvironmentKeyRecord', name: keyId }));
            return core_1.JsonEncoder.fromString(entryObject === null || entryObject === void 0 ? void 0 : entryObject.value);
        }
        catch (error) {
            throw new core_1.WalletError('Error retrieving Secure Environment record', { cause: error });
        }
    }
    async deleteKeyPair(publicKeyBase58) {
        try {
            await this.withSession((session) => session.remove({ category: 'KeyPairRecord', name: `key-${publicKeyBase58}` }));
        }
        catch (error) {
            throw new core_1.WalletError('Error removing KeyPair record', { cause: error });
        }
    }
    async storeKeyPair(keyPair) {
        try {
            await this.withSession((session) => session.insert({
                category: 'KeyPairRecord',
                name: `key-${keyPair.publicKeyBase58}`,
                value: JSON.stringify(keyPair),
                tags: {
                    keyType: keyPair.keyType,
                },
            }));
        }
        catch (error) {
            if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                throw new core_1.WalletKeyExistsError('Key already exists');
            }
            throw new core_1.WalletError('Error saving KeyPair record', { cause: error });
        }
    }
    async storeSecureEnvironmentKeyById(options) {
        try {
            await this.withSession((session) => session.insert({
                category: 'SecureEnvironmentKeyRecord',
                name: options.publicKeyBase58,
                value: JSON.stringify(options),
                tags: {
                    keyType: options.keyType,
                },
            }));
        }
        catch (error) {
            if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                throw new core_1.WalletKeyExistsError('Key already exists');
            }
            throw new core_1.WalletError('Error saving SecureEnvironment record', { cause: error });
        }
    }
}
exports.AskarBaseWallet = AskarBaseWallet;
//# sourceMappingURL=AskarBaseWallet.js.map