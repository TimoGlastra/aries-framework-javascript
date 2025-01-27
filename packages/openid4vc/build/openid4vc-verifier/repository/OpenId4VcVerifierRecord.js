"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcVerifierRecord = void 0;
const core_1 = require("@credo-ts/core");
/**
 * For OID4VC you need to expos metadata files. Each issuer needs to host this metadata. This is not the case for DIDComm where we can just have one /didcomm endpoint.
 * So we create a record per openid issuer/verifier that you want, and each tenant can create multiple issuers/verifiers which have different endpoints
 * and metadata files
 * */
class OpenId4VcVerifierRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = OpenId4VcVerifierRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.verifierId = props.verifierId;
            this.clientMetadata = props.clientMetadata;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { verifierId: this.verifierId });
    }
}
exports.OpenId4VcVerifierRecord = OpenId4VcVerifierRecord;
OpenId4VcVerifierRecord.type = 'OpenId4VcVerifierRecord';
//# sourceMappingURL=OpenId4VcVerifierRecord.js.map