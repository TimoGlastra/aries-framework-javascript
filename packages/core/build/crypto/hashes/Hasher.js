"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hasher = void 0;
const error_1 = require("../../error");
const Sha1_1 = require("./Sha1");
const Sha256_1 = require("./Sha256");
class Hasher {
    static hash(data, hashName) {
        switch (hashName.toUpperCase()) {
            case 'SHA-256':
                return new Sha256_1.Sha256().hash(data);
            case 'SHA-1':
                return new Sha1_1.Sha1().hash(data);
            default:
                throw new error_1.CredoError(`Hash name: '${hashName}' is not supported.`);
        }
    }
}
exports.Hasher = Hasher;
//# sourceMappingURL=Hasher.js.map