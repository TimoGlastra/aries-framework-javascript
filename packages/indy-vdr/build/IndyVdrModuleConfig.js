"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyVdrModuleConfig = void 0;
class IndyVdrModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link IndyVdrModuleConfigOptions.networks} */
    get networks() {
        return this.options.networks;
    }
    /** See {@link IndyVdrModuleConfigOptions.indyVdr} */
    get indyVdr() {
        return this.options.indyVdr;
    }
}
exports.IndyVdrModuleConfig = IndyVdrModuleConfig;
//# sourceMappingURL=IndyVdrModuleConfig.js.map