"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredoEd25519Provider = void 0;
const core = __importStar(require("webcrypto-core"));
const CredoWebCryptoKey_1 = require("../CredoWebCryptoKey");
class CredoEd25519Provider extends core.Ed25519Provider {
    constructor(walletWebCrypto) {
        super();
        this.walletWebCrypto = walletWebCrypto;
    }
    async onSign(algorithm, key, data) {
        return this.walletWebCrypto.sign(key, new Uint8Array(data), algorithm);
    }
    async onVerify(algorithm, key, signature, data) {
        return this.walletWebCrypto.verify(key, algorithm, new Uint8Array(data), new Uint8Array(signature));
    }
    async onGenerateKey(algorithm, extractable, keyUsages) {
        const key = await this.walletWebCrypto.generate(algorithm);
        return {
            publicKey: new CredoWebCryptoKey_1.CredoWebCryptoKey(key, algorithm, extractable, 'public', keyUsages),
            privateKey: new CredoWebCryptoKey_1.CredoWebCryptoKey(key, algorithm, extractable, 'private', keyUsages),
        };
    }
    async onExportKey(format, key) {
        return this.walletWebCrypto.exportKey(format, key);
    }
    async onImportKey(format, keyData, algorithm, extractable, keyUsages) {
        return this.walletWebCrypto.importKey(format, keyData.kty ? keyData : new Uint8Array(keyData), algorithm, extractable, keyUsages);
    }
}
exports.CredoEd25519Provider = CredoEd25519Provider;
//# sourceMappingURL=CredoEd25519Provider.js.map