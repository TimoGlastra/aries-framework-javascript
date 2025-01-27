"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameSpacesRecordToMap = nameSpacesRecordToMap;
function nameSpacesRecordToMap(nameSpaces) {
    return new Map(Object.entries(nameSpaces).map(([key, value]) => [key, new Map(Object.entries(value))]));
}
//# sourceMappingURL=mdocUtil.js.map