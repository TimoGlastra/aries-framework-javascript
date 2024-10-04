"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.didcommV1Pack = didcommV1Pack;
exports.didcommV1Unpack = didcommV1Unpack;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const JweEnvelope_1 = require("./JweEnvelope");
function didcommV1Pack(payload, recipientKeys, senderKey) {
    let cek;
    let senderExchangeKey;
    try {
        cek = aries_askar_shared_1.Key.generate(aries_askar_shared_1.KeyAlgs.Chacha20C20P);
        senderExchangeKey = senderKey ? senderKey.convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 }) : undefined;
        const recipients = [];
        for (const recipientKey of recipientKeys) {
            let targetExchangeKey;
            try {
                targetExchangeKey = aries_askar_shared_1.Key.fromPublicBytes({
                    publicKey: core_1.Key.fromPublicKeyBase58(recipientKey, core_1.KeyType.Ed25519).publicKey,
                    algorithm: aries_askar_shared_1.KeyAlgs.Ed25519,
                }).convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
                if (senderKey && senderExchangeKey) {
                    const encryptedSender = aries_askar_shared_1.CryptoBox.seal({
                        recipientKey: targetExchangeKey,
                        message: core_1.TypedArrayEncoder.fromString(core_1.TypedArrayEncoder.toBase58(senderKey.publicBytes)),
                    });
                    const nonce = aries_askar_shared_1.CryptoBox.randomNonce();
                    const encryptedCek = aries_askar_shared_1.CryptoBox.cryptoBox({
                        recipientKey: targetExchangeKey,
                        senderKey: senderExchangeKey,
                        message: cek.secretBytes,
                        nonce,
                    });
                    recipients.push(new JweEnvelope_1.JweRecipient({
                        encryptedKey: encryptedCek,
                        header: {
                            kid: recipientKey,
                            sender: core_1.TypedArrayEncoder.toBase64URL(encryptedSender),
                            iv: core_1.TypedArrayEncoder.toBase64URL(nonce),
                        },
                    }));
                }
                else {
                    const encryptedCek = aries_askar_shared_1.CryptoBox.seal({
                        recipientKey: targetExchangeKey,
                        message: cek.secretBytes,
                    });
                    recipients.push(new JweEnvelope_1.JweRecipient({
                        encryptedKey: encryptedCek,
                        header: {
                            kid: recipientKey,
                        },
                    }));
                }
            }
            finally {
                targetExchangeKey === null || targetExchangeKey === void 0 ? void 0 : targetExchangeKey.handle.free();
            }
        }
        const protectedJson = {
            enc: 'xchacha20poly1305_ietf',
            typ: 'JWM/1.0',
            alg: senderKey ? 'Authcrypt' : 'Anoncrypt',
            recipients: recipients.map((item) => core_1.JsonTransformer.toJSON(item)),
        };
        const { ciphertext, tag, nonce } = cek.aeadEncrypt({
            message: core_1.Buffer.from(JSON.stringify(payload)),
            aad: core_1.Buffer.from(core_1.JsonEncoder.toBase64URL(protectedJson)),
        }).parts;
        const envelope = new JweEnvelope_1.JweEnvelope({
            ciphertext: core_1.TypedArrayEncoder.toBase64URL(ciphertext),
            iv: core_1.TypedArrayEncoder.toBase64URL(nonce),
            protected: core_1.JsonEncoder.toBase64URL(protectedJson),
            tag: core_1.TypedArrayEncoder.toBase64URL(tag),
        }).toJson();
        return envelope;
    }
    finally {
        cek === null || cek === void 0 ? void 0 : cek.handle.free();
        senderExchangeKey === null || senderExchangeKey === void 0 ? void 0 : senderExchangeKey.handle.free();
    }
}
function didcommV1Unpack(messagePackage, recipientKey) {
    const protectedJson = core_1.JsonEncoder.fromBase64(messagePackage.protected);
    const alg = protectedJson.alg;
    if (!['Anoncrypt', 'Authcrypt'].includes(alg)) {
        throw new core_1.WalletError(`Unsupported pack algorithm: ${alg}`);
    }
    const recipient = protectedJson.recipients.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r) => r.header.kid === core_1.TypedArrayEncoder.toBase58(recipientKey.publicBytes));
    if (!recipient) {
        throw new core_1.WalletError('No corresponding recipient key found');
    }
    const sender = (recipient === null || recipient === void 0 ? void 0 : recipient.header.sender) ? core_1.TypedArrayEncoder.fromBase64(recipient.header.sender) : undefined;
    const iv = (recipient === null || recipient === void 0 ? void 0 : recipient.header.iv) ? core_1.TypedArrayEncoder.fromBase64(recipient.header.iv) : undefined;
    const encrypted_key = core_1.TypedArrayEncoder.fromBase64(recipient.encrypted_key);
    if (sender && !iv) {
        throw new core_1.WalletError('Missing IV');
    }
    else if (!sender && iv) {
        throw new core_1.WalletError('Unexpected IV');
    }
    let payloadKey, senderKey;
    let sender_x;
    let recip_x;
    try {
        recip_x = recipientKey.convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
        if (sender && iv) {
            senderKey = core_1.TypedArrayEncoder.toUtf8String(aries_askar_shared_1.CryptoBox.sealOpen({
                recipientKey: recip_x,
                ciphertext: sender,
            }));
            sender_x = aries_askar_shared_1.Key.fromPublicBytes({
                algorithm: aries_askar_shared_1.KeyAlgs.Ed25519,
                publicKey: core_1.TypedArrayEncoder.fromBase58(senderKey),
            }).convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
            payloadKey = aries_askar_shared_1.CryptoBox.open({
                recipientKey: recip_x,
                senderKey: sender_x,
                message: encrypted_key,
                nonce: iv,
            });
        }
        else {
            payloadKey = aries_askar_shared_1.CryptoBox.sealOpen({ ciphertext: encrypted_key, recipientKey: recip_x });
        }
    }
    finally {
        sender_x === null || sender_x === void 0 ? void 0 : sender_x.handle.free();
        recip_x === null || recip_x === void 0 ? void 0 : recip_x.handle.free();
    }
    if (!senderKey && alg === 'Authcrypt') {
        throw new core_1.WalletError('Sender public key not provided for Authcrypt');
    }
    let cek;
    try {
        cek = aries_askar_shared_1.Key.fromSecretBytes({ algorithm: aries_askar_shared_1.KeyAlgs.Chacha20C20P, secretKey: payloadKey });
        const message = cek.aeadDecrypt({
            ciphertext: core_1.TypedArrayEncoder.fromBase64(messagePackage.ciphertext),
            nonce: core_1.TypedArrayEncoder.fromBase64(messagePackage.iv),
            tag: core_1.TypedArrayEncoder.fromBase64(messagePackage.tag),
            aad: core_1.TypedArrayEncoder.fromString(messagePackage.protected),
        });
        return {
            plaintextMessage: core_1.JsonEncoder.fromBuffer(message),
            senderKey,
            recipientKey: core_1.TypedArrayEncoder.toBase58(recipientKey.publicBytes),
        };
    }
    finally {
        cek === null || cek === void 0 ? void 0 : cek.handle.free();
    }
}
//# sourceMappingURL=didcommV1.js.map