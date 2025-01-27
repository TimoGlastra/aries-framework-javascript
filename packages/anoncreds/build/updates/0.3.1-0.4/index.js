"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnonCredsModuleV0_3_1ToV0_4 = updateAnonCredsModuleV0_3_1ToV0_4;
const credentialDefinition_1 = require("./credentialDefinition");
const credentialExchangeRecord_1 = require("./credentialExchangeRecord");
const linkSecret_1 = require("./linkSecret");
const schema_1 = require("./schema");
async function updateAnonCredsModuleV0_3_1ToV0_4(agent) {
    await (0, credentialExchangeRecord_1.migrateCredentialExchangeRecordToV0_4)(agent);
    await (0, linkSecret_1.migrateLinkSecretToV0_4)(agent);
    await (0, credentialDefinition_1.migrateAnonCredsCredentialDefinitionRecordToV0_4)(agent);
    await (0, schema_1.migrateAnonCredsSchemaRecordToV0_4)(agent);
}
//# sourceMappingURL=index.js.map