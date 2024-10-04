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
exports.OpenId4VcIssuanceSessionRecord = void 0;
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
class OpenId4VcIssuanceSessionRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = OpenId4VcIssuanceSessionRecord.type;
        /**
         * The credentials that were issued during this session.
         */
        this.issuedCredentials = [];
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.issuerId = props.issuerId;
            this.cNonce = props.cNonce;
            this.cNonceExpiresAt = props.cNonceExpiresAt;
            this.userPin = props.userPin;
            this.preAuthorizedCode = props.preAuthorizedCode;
            this.credentialOfferUri = props.credentialOfferUri;
            this.credentialOfferPayload = props.credentialOfferPayload;
            this.issuanceMetadata = props.issuanceMetadata;
            this.state = props.state;
            this.errorMessage = props.errorMessage;
        }
    }
    assertState(expectedStates) {
        if (!Array.isArray(expectedStates)) {
            expectedStates = [expectedStates];
        }
        if (!expectedStates.includes(this.state)) {
            throw new core_1.CredoError(`OpenId4VcIssuanceSessionRecord is in invalid state ${this.state}. Valid states are: ${expectedStates.join(', ')}.`);
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { issuerId: this.issuerId, cNonce: this.cNonce, credentialOfferUri: this.credentialOfferUri, preAuthorizedCode: this.preAuthorizedCode, state: this.state });
    }
}
exports.OpenId4VcIssuanceSessionRecord = OpenId4VcIssuanceSessionRecord;
OpenId4VcIssuanceSessionRecord.type = 'OpenId4VcIssuanceSessionRecord';
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        // CredentialIssued is an old state that is no longer used. It should be mapped to Error.
        if (value === 'CredentialIssued') {
            return OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error;
        }
        return value;
    }),
    __metadata("design:type", String)
], OpenId4VcIssuanceSessionRecord.prototype, "state", void 0);
__decorate([
    (0, core_1.DateTransformer)(),
    __metadata("design:type", Date
    /**
     * Pre authorized code used for the issuance session. Only used when a pre-authorized credential
     * offer is created.
     */
    )
], OpenId4VcIssuanceSessionRecord.prototype, "cNonceExpiresAt", void 0);
//# sourceMappingURL=OpenId4VcIssuanceSessionRecord.js.map