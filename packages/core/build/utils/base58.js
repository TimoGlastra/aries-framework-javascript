"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFromBase58 = decodeFromBase58;
exports.encodeToBase58 = encodeToBase58;
const base_x_1 = __importDefault(require("@multiformats/base-x"));
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58Converter = (0, base_x_1.default)(BASE58_ALPHABET);
function decodeFromBase58(base58) {
    return base58Converter.decode(base58);
}
function encodeToBase58(buffer) {
    return base58Converter.encode(buffer);
}
//# sourceMappingURL=base58.js.map