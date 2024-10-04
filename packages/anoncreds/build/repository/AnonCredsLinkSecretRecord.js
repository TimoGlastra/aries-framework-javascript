"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsLinkSecretRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsLinkSecretRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a;
        super();
        this.type = AnonCredsLinkSecretRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.linkSecretId = props.linkSecretId;
            this.value = props.value;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { linkSecretId: this.linkSecretId });
    }
}
exports.AnonCredsLinkSecretRecord = AnonCredsLinkSecretRecord;
AnonCredsLinkSecretRecord.type = 'AnonCredsLinkSecretRecord';
//# sourceMappingURL=AnonCredsLinkSecretRecord.js.map