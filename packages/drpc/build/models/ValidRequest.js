"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidDrpcRequest = IsValidDrpcRequest;
exports.isValidDrpcRequest = isValidDrpcRequest;
const class_validator_1 = require("class-validator");
function IsValidDrpcRequest(validationOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target, propertyKey) => {
        (0, class_validator_1.ValidateBy)({
            name: 'isValidDrpcRequest',
            validator: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                validate: (value) => {
                    // Check if value is a DrpcRequestObject or an array of DrpcRequestObject
                    let isValid = false;
                    if (!Array.isArray(value)) {
                        isValid = isValidDrpcRequest(value);
                    }
                    else {
                        isValid = value.every(isValidDrpcRequest);
                    }
                    if (!isValid) {
                        throw new class_validator_1.ValidationError();
                    }
                    return isValid;
                },
                defaultMessage: (0, class_validator_1.buildMessage)((eachPrefix) => eachPrefix + '$property is not a valid DrpcRequest', validationOptions),
            },
        }, validationOptions)(target, propertyKey);
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidDrpcRequest(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    return 'jsonrpc' in value && 'method' in value && 'id' in value;
}
//# sourceMappingURL=ValidRequest.js.map