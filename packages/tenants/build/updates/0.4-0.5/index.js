"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantsModuleV0_4ToV0_5 = updateTenantsModuleV0_4ToV0_5;
const tenantRecord_1 = require("./tenantRecord");
async function updateTenantsModuleV0_4ToV0_5(agent) {
    await (0, tenantRecord_1.migrateTenantRecordToV0_5)(agent);
}
//# sourceMappingURL=index.js.map