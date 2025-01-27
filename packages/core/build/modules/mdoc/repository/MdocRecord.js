"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdocRecord = void 0;
const BaseRecord_1 = require("../../../storage/BaseRecord");
const utils_1 = require("../../../utils");
const uuid_1 = require("../../../utils/uuid");
const Mdoc_1 = require("../Mdoc");
class MdocRecord extends BaseRecord_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = MdocRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : (0, uuid_1.uuid)();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this.base64Url = props.mdoc.base64Url;
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
        }
    }
    /**
     * credential is convenience method added to all credential records
     */
    get credential() {
        return Mdoc_1.Mdoc.fromBase64Url(this.base64Url);
    }
    /**
     * encoded is convenience method added to all credential records
     */
    get encoded() {
        return this.base64Url;
    }
    getTags() {
        const mdoc = Mdoc_1.Mdoc.fromBase64Url(this.base64Url);
        const docType = mdoc.docType;
        const alg = mdoc.alg;
        return Object.assign(Object.assign({}, this._tags), { docType,
            alg });
    }
    clone() {
        return utils_1.JsonTransformer.fromJSON(utils_1.JsonTransformer.toJSON(this), this.constructor);
    }
}
exports.MdocRecord = MdocRecord;
MdocRecord.type = 'MdocRecord';
//# sourceMappingURL=MdocRecord.js.map