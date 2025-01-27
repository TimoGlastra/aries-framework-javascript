"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRecord = void 0;
const core_1 = require("@credo-ts/core");
class TenantRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = TenantRecord.type;
        /**
         * The storage version that is used by this tenant. Can be used to know if the tenant is ready to be used
         * with the current version of the application.
         *
         * @default 0.4 from 0.5 onwards we set the storage version on creation, so if no value
         * is stored, it means the storage version is 0.4 (when multi-tenancy was introduced)
         */
        this.storageVersion = '0.4';
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.config = props.config;
            this.storageVersion = props.storageVersion;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { label: this.config.label, storageVersion: this.storageVersion });
    }
}
exports.TenantRecord = TenantRecord;
TenantRecord.type = 'TenantRecord';
//# sourceMappingURL=TenantRecord.js.map