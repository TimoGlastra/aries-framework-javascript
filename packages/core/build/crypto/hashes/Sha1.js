"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sha1 = void 0;
const sha1_1 = require("@noble/hashes/sha1");
class Sha1 {
    hash(data) {
        return (0, sha1_1.sha1)(data);
    }
}
exports.Sha1 = Sha1;
//# sourceMappingURL=Sha1.js.map