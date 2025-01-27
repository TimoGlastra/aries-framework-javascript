"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = uuid;
exports.isValidUuid = isValidUuid;
const uuid_1 = require("uuid");
function uuid() {
    return (0, uuid_1.v4)();
}
function isValidUuid(id) {
    return (0, uuid_1.validate)(id);
}
//# sourceMappingURL=uuid.js.map