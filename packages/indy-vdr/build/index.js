"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrPoolService = exports.IndyVdrSovDidResolver = exports.IndyVdrIndyDidResolver = exports.IndyVdrIndyDidRegistrar = void 0;
var dids_1 = require("./dids");
Object.defineProperty(exports, "IndyVdrIndyDidRegistrar", { enumerable: true, get: function () { return dids_1.IndyVdrIndyDidRegistrar; } });
Object.defineProperty(exports, "IndyVdrIndyDidResolver", { enumerable: true, get: function () { return dids_1.IndyVdrIndyDidResolver; } });
Object.defineProperty(exports, "IndyVdrSovDidResolver", { enumerable: true, get: function () { return dids_1.IndyVdrSovDidResolver; } });
var pool_1 = require("./pool");
Object.defineProperty(exports, "IndyVdrPoolService", { enumerable: true, get: function () { return pool_1.IndyVdrPoolService; } });
__exportStar(require("./IndyVdrModule"), exports);
__exportStar(require("./IndyVdrModuleConfig"), exports);
__exportStar(require("./anoncreds"), exports);
//# sourceMappingURL=index.js.map