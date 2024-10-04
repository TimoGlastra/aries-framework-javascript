"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyDerivationMethodToStoreKeyMethod = exports.transformFromRecordTagValues = void 0;
const core_1 = require("@credo-ts/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
/**
 * Adopted from `AskarStorageService` implementation and should be kept in sync.
 */
const transformFromRecordTagValues = (tags) => {
    const transformedTags = {};
    for (const [key, value] of Object.entries(tags)) {
        // If the value is of type null we use the value undefined
        // Askar doesn't support null as a value
        if (value === null) {
            transformedTags[key] = undefined;
        }
        // If the value is a boolean use the Askar
        // '1' or '0' syntax
        else if (typeof value === 'boolean') {
            transformedTags[key] = value ? '1' : '0';
        }
        // If the value is 1 or 0, we need to add something to the value, otherwise
        // the next time we deserialize the tag values it will be converted to boolean
        else if (value === '1' || value === '0') {
            transformedTags[key] = `n__${value}`;
        }
        // If the value is an array we create a tag for each array
        // item ("tagName:arrayItem" = "1")
        else if (Array.isArray(value)) {
            value.forEach((item) => {
                const tagName = `${key}:${item}`;
                transformedTags[tagName] = '1';
            });
        }
        // Otherwise just use the value
        else {
            transformedTags[key] = value;
        }
    }
    return transformedTags;
};
exports.transformFromRecordTagValues = transformFromRecordTagValues;
const keyDerivationMethodToStoreKeyMethod = (keyDerivationMethod) => {
    const correspondenceTable = {
        [core_1.KeyDerivationMethod.Raw]: aries_askar_shared_1.KdfMethod.Raw,
        [core_1.KeyDerivationMethod.Argon2IInt]: aries_askar_shared_1.KdfMethod.Argon2IInt,
        [core_1.KeyDerivationMethod.Argon2IMod]: aries_askar_shared_1.KdfMethod.Argon2IMod,
    };
    return new aries_askar_shared_1.StoreKeyMethod(correspondenceTable[keyDerivationMethod]);
};
exports.keyDerivationMethodToStoreKeyMethod = keyDerivationMethodToStoreKeyMethod;
//# sourceMappingURL=utils.js.map