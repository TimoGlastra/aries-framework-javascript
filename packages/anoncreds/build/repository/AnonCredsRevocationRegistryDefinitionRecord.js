"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRevocationRegistryDefinitionRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsRevocationRegistryDefinitionRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b;
        super();
        this.type = AnonCredsRevocationRegistryDefinitionRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.revocationRegistryDefinitionId = props.revocationRegistryDefinitionId;
            this.revocationRegistryDefinition = props.revocationRegistryDefinition;
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { revocationRegistryDefinitionId: this.revocationRegistryDefinitionId, credentialDefinitionId: this.revocationRegistryDefinition.credDefId });
    }
}
exports.AnonCredsRevocationRegistryDefinitionRecord = AnonCredsRevocationRegistryDefinitionRecord;
AnonCredsRevocationRegistryDefinitionRecord.type = 'AnonCredsRevocationRegistryDefinitionRecord';
//# sourceMappingURL=AnonCredsRevocationRegistryDefinitionRecord.js.map