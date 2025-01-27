"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDisclosureFrameForPayload = buildDisclosureFrameForPayload;
const class_validator_1 = require("class-validator");
function buildDisclosureFrameForPayload(input) {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => {
        // TODO: Array disclosure frames are not yet supported - treating entire array as disclosed
        if (Array.isArray(value)) {
            return [key, true];
        }
        else if ((0, class_validator_1.isObject)(value)) {
            if (Object.keys.length === 0)
                return [key, false];
            return [key, buildDisclosureFrameForPayload(value)];
        }
        else {
            return [key, true];
        }
    }));
}
//# sourceMappingURL=disclosureFrame.js.map