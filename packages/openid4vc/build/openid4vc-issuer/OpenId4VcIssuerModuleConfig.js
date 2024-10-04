"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerModuleConfig = void 0;
const router_1 = require("../shared/router");
const DEFAULT_C_NONCE_EXPIRES_IN = 5 * 60; // 5 minutes
const DEFAULT_TOKEN_EXPIRES_IN = 3 * 60; // 3 minutes
const DEFAULT_PRE_AUTH_CODE_EXPIRES_IN = 3 * 60; // 3 minutes
class OpenId4VcIssuerModuleConfig {
    constructor(options) {
        var _a;
        this.options = options;
        this.router = (_a = options.router) !== null && _a !== void 0 ? _a : (0, router_1.importExpress)().Router();
    }
    get baseUrl() {
        return this.options.baseUrl;
    }
    /**
     * Get the credential endpoint config, with default values set
     */
    get credentialEndpoint() {
        var _a;
        // Use user supplied options, or return defaults.
        const userOptions = this.options.endpoints.credential;
        return Object.assign(Object.assign({}, userOptions), { endpointPath: (_a = userOptions.endpointPath) !== null && _a !== void 0 ? _a : '/credential' });
    }
    /**
     * Get the access token endpoint config, with default values set
     */
    get accessTokenEndpoint() {
        var _a, _b, _c, _d, _e;
        // Use user supplied options, or return defaults.
        const userOptions = (_a = this.options.endpoints.accessToken) !== null && _a !== void 0 ? _a : {};
        return Object.assign(Object.assign({}, userOptions), { endpointPath: (_b = userOptions.endpointPath) !== null && _b !== void 0 ? _b : '/token', cNonceExpiresInSeconds: (_c = userOptions.cNonceExpiresInSeconds) !== null && _c !== void 0 ? _c : DEFAULT_C_NONCE_EXPIRES_IN, preAuthorizedCodeExpirationInSeconds: (_d = userOptions.preAuthorizedCodeExpirationInSeconds) !== null && _d !== void 0 ? _d : DEFAULT_PRE_AUTH_CODE_EXPIRES_IN, tokenExpiresInSeconds: (_e = userOptions.tokenExpiresInSeconds) !== null && _e !== void 0 ? _e : DEFAULT_TOKEN_EXPIRES_IN });
    }
    /**
     * Get the hosted credential offer endpoint config, with default values set
     */
    get credentialOfferEndpoint() {
        var _a, _b;
        // Use user supplied options, or return defaults.
        const userOptions = (_a = this.options.endpoints.credentialOffer) !== null && _a !== void 0 ? _a : {};
        return Object.assign(Object.assign({}, userOptions), { endpointPath: (_b = userOptions.endpointPath) !== null && _b !== void 0 ? _b : '/offers' });
    }
}
exports.OpenId4VcIssuerModuleConfig = OpenId4VcIssuerModuleConfig;
//# sourceMappingURL=OpenId4VcIssuerModuleConfig.js.map