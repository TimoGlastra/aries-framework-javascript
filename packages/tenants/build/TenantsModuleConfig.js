"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsModuleConfig = void 0;
class TenantsModuleConfig {
    constructor(options) {
        this.options = options !== null && options !== void 0 ? options : {};
    }
    /** See {@link TenantsModuleConfigOptions.sessionLimit} */
    get sessionLimit() {
        var _a;
        return (_a = this.options.sessionLimit) !== null && _a !== void 0 ? _a : 100;
    }
    /** See {@link TenantsModuleConfigOptions.sessionAcquireTimeout} */
    get sessionAcquireTimeout() {
        var _a;
        return (_a = this.options.sessionAcquireTimeout) !== null && _a !== void 0 ? _a : 1000;
    }
}
exports.TenantsModuleConfig = TenantsModuleConfig;
//# sourceMappingURL=TenantsModuleConfig.js.map