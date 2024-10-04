"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerRecord = void 0;
const core_1 = require("@credo-ts/core");
const issuerMetadataUtils_1 = require("../../shared/issuerMetadataUtils");
/**
 * For OID4VC you need to expos metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
class OpenId4VcIssuerRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c, _d;
        super();
        this.type = OpenId4VcIssuerRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.issuerId = props.issuerId;
            this.accessTokenPublicKeyFingerprint = props.accessTokenPublicKeyFingerprint;
            this.credentialsSupported =
                (_d = props.credentialsSupported) !== null && _d !== void 0 ? _d : (0, issuerMetadataUtils_1.credentialsSupportedV13ToV11)(props.credentialConfigurationsSupported);
            this.credentialConfigurationsSupported = props.credentialConfigurationsSupported;
            this.dpopSigningAlgValuesSupported = props.dpopSigningAlgValuesSupported;
            this.display = props.display;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { issuerId: this.issuerId });
    }
}
exports.OpenId4VcIssuerRecord = OpenId4VcIssuerRecord;
OpenId4VcIssuerRecord.type = 'OpenId4VcIssuerRecord';
//# sourceMappingURL=OpenId4VcIssuerRecord.js.map