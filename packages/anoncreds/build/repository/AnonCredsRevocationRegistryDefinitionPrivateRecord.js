"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRevocationRegistryDefinitionPrivateRecord = exports.AnonCredsRevocationRegistryState = void 0;
const core_1 = require("@credo-ts/core");
var AnonCredsRevocationRegistryState;
(function (AnonCredsRevocationRegistryState) {
    AnonCredsRevocationRegistryState["Created"] = "created";
    AnonCredsRevocationRegistryState["Active"] = "active";
    AnonCredsRevocationRegistryState["Full"] = "full";
})(AnonCredsRevocationRegistryState || (exports.AnonCredsRevocationRegistryState = AnonCredsRevocationRegistryState = {}));
class AnonCredsRevocationRegistryDefinitionPrivateRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b;
        super();
        this.type = AnonCredsRevocationRegistryDefinitionPrivateRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.revocationRegistryDefinitionId = props.revocationRegistryDefinitionId;
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.value = props.value;
            this.state = (_b = props.state) !== null && _b !== void 0 ? _b : AnonCredsRevocationRegistryState.Created;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { revocationRegistryDefinitionId: this.revocationRegistryDefinitionId, credentialDefinitionId: this.credentialDefinitionId, state: this.state });
    }
}
exports.AnonCredsRevocationRegistryDefinitionPrivateRecord = AnonCredsRevocationRegistryDefinitionPrivateRecord;
AnonCredsRevocationRegistryDefinitionPrivateRecord.type = 'AnonCredsRevocationRegistryDefinitionPrivateRecord';
//# sourceMappingURL=AnonCredsRevocationRegistryDefinitionPrivateRecord.js.map