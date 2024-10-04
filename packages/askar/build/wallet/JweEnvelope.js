"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JweEnvelope = exports.JweRecipient = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
class JweRecipient {
    constructor(options) {
        if (options) {
            this.encryptedKey = core_1.TypedArrayEncoder.toBase64URL(options.encryptedKey);
            this.header = options.header;
        }
    }
}
exports.JweRecipient = JweRecipient;
__decorate([
    (0, class_transformer_1.Expose)({ name: 'encrypted_key' }),
    __metadata("design:type", String)
], JweRecipient.prototype, "encryptedKey", void 0);
class JweEnvelope {
    constructor(options) {
        if (options) {
            this.protected = options.protected;
            this.unprotected = options.unprotected;
            this.recipients = options.recipients;
            this.ciphertext = options.ciphertext;
            this.iv = options.iv;
            this.tag = options.tag;
            this.aad = options.aad;
            this.header = options.header;
            this.encryptedKey = options.encryptedKey;
        }
    }
    toJson() {
        return core_1.JsonTransformer.toJSON(this);
    }
}
exports.JweEnvelope = JweEnvelope;
__decorate([
    (0, class_transformer_1.Type)(() => JweRecipient),
    __metadata("design:type", Array)
], JweEnvelope.prototype, "recipients", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'encrypted_key' }),
    __metadata("design:type", String)
], JweEnvelope.prototype, "encryptedKey", void 0);
//# sourceMappingURL=JweEnvelope.js.map