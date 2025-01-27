"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordToInstance = recordToInstance;
exports.transformToRecordTagValues = transformToRecordTagValues;
exports.transformFromRecordTagValues = transformFromRecordTagValues;
exports.askarQueryFromSearchQuery = askarQueryFromSearchQuery;
const core_1 = require("@credo-ts/core");
function recordToInstance(record, recordClass) {
    const instance = core_1.JsonTransformer.deserialize(record.value, recordClass);
    instance.id = record.name;
    const tags = record.tags ? transformToRecordTagValues(record.tags) : {};
    instance.replaceTags(tags);
    return instance;
}
function transformToRecordTagValues(tags) {
    const transformedTags = {};
    for (const [key, value] of Object.entries(tags)) {
        // If the value is a boolean string ('1' or '0')
        // use the boolean val
        if (value === '1' && (key === null || key === void 0 ? void 0 : key.includes(':'))) {
            const [tagName, ...tagValues] = key.split(':');
            const tagValue = tagValues.join(':');
            const transformedValue = transformedTags[tagName];
            if (Array.isArray(transformedValue)) {
                transformedTags[tagName] = [...transformedValue, tagValue];
            }
            else {
                transformedTags[tagName] = [tagValue];
            }
        }
        // Transform '1' and '0' to boolean
        else if (value === '1' || value === '0') {
            transformedTags[key] = value === '1';
        }
        // If 1 or 0 is prefixed with 'n__' we need to remove it. This is to prevent
        // casting the value to a boolean
        else if (value === 'n__1' || value === 'n__0') {
            transformedTags[key] = value === 'n__1' ? '1' : '0';
        }
        // Otherwise just use the value
        else {
            transformedTags[key] = value;
        }
    }
    return transformedTags;
}
function transformFromRecordTagValues(tags) {
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
}
/**
 * Transforms the search query into a wallet query compatible with Askar WQL.
 *
 * The format used by Credo is almost the same as the WQL query, with the exception of
 * the encoding of values, however this is handled by the {@link AskarStorageServiceUtil.transformToRecordTagValues}
 * method.
 */
function askarQueryFromSearchQuery(query) {
    // eslint-disable-next-line prefer-const
    let { $and, $or, $not } = query, tags = __rest(query, ["$and", "$or", "$not"]);
    $and = $and === null || $and === void 0 ? void 0 : $and.map((q) => askarQueryFromSearchQuery(q));
    $or = $or === null || $or === void 0 ? void 0 : $or.map((q) => askarQueryFromSearchQuery(q));
    $not = $not ? askarQueryFromSearchQuery($not) : undefined;
    const askarQuery = Object.assign(Object.assign({}, transformFromRecordTagValues(tags)), { $and,
        $or,
        $not });
    return askarQuery;
}
//# sourceMappingURL=utils.js.map