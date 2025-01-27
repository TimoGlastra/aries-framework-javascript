"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcVerifierModuleConfig = void 0;
const router_1 = require("../shared/router");
class OpenId4VcVerifierModuleConfig {
    constructor(options) {
        var _a;
        this.options = options;
        this.router = (_a = options.router) !== null && _a !== void 0 ? _a : (0, router_1.importExpress)().Router();
    }
    get baseUrl() {
        return this.options.baseUrl;
    }
    get authorizationRequestEndpoint() {
        var _a, _b, _c, _d;
        // Use user supplied options, or return defaults.
        const userOptions = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.authorizationRequest;
        return Object.assign(Object.assign({}, userOptions), { endpointPath: (_d = (_c = (_b = this.options.endpoints) === null || _b === void 0 ? void 0 : _b.authorizationRequest) === null || _c === void 0 ? void 0 : _c.endpointPath) !== null && _d !== void 0 ? _d : '/authorization-requests' });
    }
    get authorizationEndpoint() {
        var _a, _b;
        // Use user supplied options, or return defaults.
        const userOptions = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.authorization;
        return Object.assign(Object.assign({}, userOptions), { endpointPath: (_b = userOptions === null || userOptions === void 0 ? void 0 : userOptions.endpointPath) !== null && _b !== void 0 ? _b : '/authorize' });
    }
    get federation() {
        return this.options.federation;
    }
}
exports.OpenId4VcVerifierModuleConfig = OpenId4VcVerifierModuleConfig;
//# sourceMappingURL=OpenId4VcVerifierModuleConfig.js.map