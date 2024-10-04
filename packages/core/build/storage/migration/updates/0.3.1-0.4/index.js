"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateV0_3_1ToV0_4 = updateV0_3_1ToV0_4;
const cache_1 = require("./cache");
const did_1 = require("./did");
const w3cCredentialRecord_1 = require("./w3cCredentialRecord");
async function updateV0_3_1ToV0_4(agent) {
    await (0, did_1.migrateDidRecordToV0_4)(agent);
    await (0, cache_1.migrateCacheToV0_4)(agent);
    await (0, w3cCredentialRecord_1.migrateW3cCredentialRecordToV0_4)(agent);
}
//# sourceMappingURL=index.js.map