"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsMap = IsMap;
const class_validator_1 = require("class-validator");
/**
 * Checks if a given value is a Map
 */
function IsMap(validationOptions) {
    return (0, class_validator_1.ValidateBy)({
        name: 'isMap',
        validator: {
            validate: (value) => value instanceof Map,
            defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property must be a Map', validationOptions),
        },
    }, validationOptions);
}
//# sourceMappingURL=isMap.js.map