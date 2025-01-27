"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVersionString = parseVersionString;
exports.isFirstVersionHigherThanSecond = isFirstVersionHigherThanSecond;
exports.isFirstVersionEqualToSecond = isFirstVersionEqualToSecond;
function parseVersionString(version) {
    const [major, minor, patch] = version.split('.');
    return [Number(major), Number(minor), Number(patch !== null && patch !== void 0 ? patch : '0')];
}
function isFirstVersionHigherThanSecond(first, second) {
    return (first[0] > second[0] ||
        (first[0] === second[0] && first[1] > second[1]) ||
        (first[0] === second[0] && first[1] === second[1] && first[2] > second[2]));
}
function isFirstVersionEqualToSecond(first, second) {
    return first[0] === second[0] && first[1] === second[1] && first[2] === second[2];
}
//# sourceMappingURL=version.js.map