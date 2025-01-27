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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerRecord = void 0;
const oid4vci_1 = require("@animo-id/oid4vci");
const core_1 = require("@credo-ts/core");
const class_transformer_1 = require("class-transformer");
/**
 * For OID4VC you need to expose metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
class OpenId4VcIssuerRecord extends core_1.BaseRecord {
    /**
     * Only here for class transformation. If credentialsSupported is set we transform
     * it to the new credentialConfigurationsSupported format
     */
    set credentialsSupported(credentialsSupported) {
        if (this.credentialConfigurationsSupported)
            return;
        this.credentialConfigurationsSupported =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (0, oid4vci_1.credentialsSupportedToCredentialConfigurationsSupported)(credentialsSupported);
    }
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = OpenId4VcIssuerRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.issuerId = props.issuerId;
            this.accessTokenPublicKeyFingerprint = props.accessTokenPublicKeyFingerprint;
            this.credentialConfigurationsSupported = props.credentialConfigurationsSupported;
            this.dpopSigningAlgValuesSupported = props.dpopSigningAlgValuesSupported;
            this.display = props.display;
            this.authorizationServerConfigs = props.authorizationServerConfigs;
            this.batchCredentialIssuance = props.batchCredentialIssuance;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { issuerId: this.issuerId });
    }
}
exports.OpenId4VcIssuerRecord = OpenId4VcIssuerRecord;
OpenId4VcIssuerRecord.type = 'OpenId4VcIssuerRecord';
__decorate([
    (0, class_transformer_1.Transform)(({ type, value }) => {
        if (type === class_transformer_1.TransformationType.PLAIN_TO_CLASS && Array.isArray(value)) {
            return value.map((display) => {
                var _a, _b;
                if ((_a = display.logo) === null || _a === void 0 ? void 0 : _a.uri)
                    return display;
                const _c = (_b = display.logo) !== null && _b !== void 0 ? _b : {}, { url } = _c, logoRest = __rest(_c, ["url"]);
                return Object.assign(Object.assign({}, display), { logo: url
                        ? Object.assign(Object.assign({}, logoRest), { uri: url }) : undefined });
            });
        }
        return value;
    }),
    __metadata("design:type", Array)
], OpenId4VcIssuerRecord.prototype, "display", void 0);
//# sourceMappingURL=OpenId4VcIssuerRecord.js.map