"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnonCredsModuleV0_4ToV0_5 = updateAnonCredsModuleV0_4ToV0_5;
const anonCredsCredentialRecord_1 = require("./anonCredsCredentialRecord");
async function updateAnonCredsModuleV0_4ToV0_5(agent) {
    await (0, anonCredsCredentialRecord_1.storeAnonCredsInW3cFormatV0_5)(agent);
}
//# sourceMappingURL=index.js.map