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
exports.V1CredentialPreview = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
/**
 * Credential preview inner message class.
 *
 * This is not a message but an inner object for other messages in this protocol. It is used construct a preview of the data for the credential.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#preview-credential
 */
class V1CredentialPreview {
    constructor(options) {
        this.type = V1CredentialPreview.type.messageTypeUri;
        if (options) {
            this.attributes = options.attributes.map((a) => new core_1.CredentialPreviewAttribute(a));
        }
    }
    toJSON() {
        return core_1.JsonTransformer.toJSON(this);
    }
    /**
     * Create a credential preview from a record with name and value entries.
     *
     * @example
     * const preview = CredentialPreview.fromRecord({
     *   name: "Bob",
     *   age: "20"
     * })
     */
    static fromRecord(record) {
        const attributes = Object.entries(record).map(([name, value]) => new core_1.CredentialPreviewAttribute({
            name,
            mimeType: 'text/plain',
            value,
        }));
        return new V1CredentialPreview({
            attributes,
        });
    }
}
exports.V1CredentialPreview = V1CredentialPreview;
V1CredentialPreview.type = (0, core_1.parseMessageType)('https://didcomm.org/issue-credential/1.0/credential-preview');
__decorate([
    (0, class_transformer_1.Expose)({ name: '@type' }),
    (0, core_1.IsValidMessageType)(V1CredentialPreview.type),
    (0, class_transformer_1.Transform)(({ value }) => (0, core_1.replaceLegacyDidSovPrefix)(value), {
        toClassOnly: true,
    }),
    __metadata("design:type", Object)
], V1CredentialPreview.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => core_1.CredentialPreviewAttribute),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsInstance)(core_1.CredentialPreviewAttribute, { each: true }),
    __metadata("design:type", Array)
], V1CredentialPreview.prototype, "attributes", void 0);
//# sourceMappingURL=V1CredentialPreview.js.map