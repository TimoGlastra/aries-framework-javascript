"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdJwtVcRecord = void 0;
const decode_1 = require("@sd-jwt/decode");
const crypto_1 = require("../../../crypto");
const BaseRecord_1 = require("../../../storage/BaseRecord");
const utils_1 = require("../../../utils");
const uuid_1 = require("../../../utils/uuid");
const decodeSdJwtVc_1 = require("../decodeSdJwtVc");
class SdJwtVcRecord extends BaseRecord_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = SdJwtVcRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : (0, uuid_1.uuid)();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this.compactSdJwtVc = props.compactSdJwtVc;
            this.typeMetadata = props.typeMetadata;
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
        }
    }
    /**
     * credential is convenience method added to all credential records
     */
    get credential() {
        return (0, decodeSdJwtVc_1.decodeSdJwtVc)(this.compactSdJwtVc, this.typeMetadata);
    }
    /**
     * encoded is convenience method added to all credential records
     */
    get encoded() {
        return this.compactSdJwtVc;
    }
    getTags() {
        const sdjwt = (0, decode_1.decodeSdJwtSync)(this.compactSdJwtVc, crypto_1.Hasher.hash);
        const vct = sdjwt.jwt.payload['vct'];
        const sdAlg = sdjwt.jwt.payload['_sd_alg'];
        const alg = sdjwt.jwt.header['alg'];
        return Object.assign(Object.assign({}, this._tags), { vct, sdAlg: sdAlg !== null && sdAlg !== void 0 ? sdAlg : 'sha-256', alg });
    }
    clone() {
        return utils_1.JsonTransformer.fromJSON(utils_1.JsonTransformer.toJSON(this), this.constructor);
    }
}
exports.SdJwtVcRecord = SdJwtVcRecord;
SdJwtVcRecord.type = 'SdJwtVcRecord';
//# sourceMappingURL=SdJwtVcRecord.js.map