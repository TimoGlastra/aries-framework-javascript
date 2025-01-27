"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsModuleConfig = void 0;
const tails_1 = require("./services/tails");
/**
 * @public
 */
class AnonCredsModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link AnonCredsModuleConfigOptions.registries} */
    get registries() {
        return this.options.registries;
    }
    /** See {@link AnonCredsModuleConfigOptions.tailsFileService} */
    get tailsFileService() {
        var _a;
        return (_a = this.options.tailsFileService) !== null && _a !== void 0 ? _a : new tails_1.BasicTailsFileService();
    }
    get anoncreds() {
        return this.options.anoncreds;
    }
    /** See {@link AnonCredsModuleConfigOptions.autoCreateLinkSecret} */
    get autoCreateLinkSecret() {
        var _a;
        return (_a = this.options.autoCreateLinkSecret) !== null && _a !== void 0 ? _a : true;
    }
}
exports.AnonCredsModuleConfig = AnonCredsModuleConfig;
//# sourceMappingURL=AnonCredsModuleConfig.js.map