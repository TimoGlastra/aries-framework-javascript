"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateV0_3ToV0_3_1 = updateV0_3ToV0_3_1;
const did_1 = require("./did");
async function updateV0_3ToV0_3_1(agent) {
    await (0, did_1.migrateDidRecordToV0_3_1)(agent);
}
//# sourceMappingURL=index.js.map