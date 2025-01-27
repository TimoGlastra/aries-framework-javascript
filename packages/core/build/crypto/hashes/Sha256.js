"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sha256 = void 0;
const sha256_1 = require("@noble/hashes/sha256");
class Sha256 {
    hash(data) {
        return (0, sha256_1.sha256)(data);
    }
}
exports.Sha256 = Sha256;
//# sourceMappingURL=Sha256.js.map