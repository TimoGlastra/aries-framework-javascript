"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRoutingRecord = void 0;
const core_1 = require("@credo-ts/core");
class TenantRoutingRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = TenantRoutingRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.tenantId = props.tenantId;
            this.recipientKeyFingerprint = props.recipientKeyFingerprint;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { tenantId: this.tenantId, recipientKeyFingerprint: this.recipientKeyFingerprint });
    }
}
exports.TenantRoutingRecord = TenantRoutingRecord;
TenantRoutingRecord.type = 'TenantRoutingRecord';
//# sourceMappingURL=TenantRoutingRecord.js.map