"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialDefinitionPrivateRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsCredentialDefinitionPrivateRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b;
        super();
        this.type = AnonCredsCredentialDefinitionPrivateRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.value = props.value;
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { credentialDefinitionId: this.credentialDefinitionId });
    }
}
exports.AnonCredsCredentialDefinitionPrivateRecord = AnonCredsCredentialDefinitionPrivateRecord;
AnonCredsCredentialDefinitionPrivateRecord.type = 'AnonCredsCredentialDefinitionPrivateRecord';
//# sourceMappingURL=AnonCredsCredentialDefinitionPrivateRecord.js.map