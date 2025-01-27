"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcIssuerModuleConfig = void 0;
const router_1 = require("../shared/router");
const DEFAULT_C_NONCE_EXPIRES_IN = 1 * 60; // 1 minute
const DEFAULT_AUTHORIZATION_CODE_EXPIRES_IN = 1 * 60; // 1 minute
const DEFAULT_TOKEN_EXPIRES_IN = 3 * 60; // 3 minutes
const DEFAULT_STATEFULL_CREDENTIAL_OFFER_EXPIRES_IN = 3 * 60; // 3 minutes
class OpenId4VcIssuerModuleConfig {
    constructor(options) {
        var _a;
        this.options = options;
        this.getVerificationSessionForIssuanceSessionAuthorization =
            options.getVerificationSessionForIssuanceSessionAuthorization;
        this.router = (_a = options.router) !== null && _a !== void 0 ? _a : (0, router_1.importExpress)().Router();
    }
    get baseUrl() {
        return this.options.baseUrl;
    }
    /**
     * A function mapping a credential request to the credential to be issued.
     */
    get credentialRequestToCredentialMapper() {
        return this.options.credentialRequestToCredentialMapper;
    }
    /**
     * The time after which a cNone will expire.
     *
     * @default 60 (1 minute)
     */
    get cNonceExpiresInSeconds() {
        var _a;
        return (_a = this.options.cNonceExpiresInSeconds) !== null && _a !== void 0 ? _a : DEFAULT_C_NONCE_EXPIRES_IN;
    }
    /**
     * The time after which a statefull credential offer not bound to a subject expires. Once the offer has been bound
     * to a subject the access token expiration takes effect. This is to prevent long-lived `pre-authorized_code` and
     * `issuer_state` values.
     *
     * @default 360 (5 minutes)
     */
    get statefullCredentialOfferExpirationInSeconds() {
        var _a;
        return (_a = this.options.statefullCredentialOfferExpirationInSeconds) !== null && _a !== void 0 ? _a : DEFAULT_STATEFULL_CREDENTIAL_OFFER_EXPIRES_IN;
    }
    /**
     * The time after which a cNonce will expire.
     *
     * @default 60 (1 minute)
     */
    get authorizationCodeExpiresInSeconds() {
        var _a;
        return (_a = this.options.authorizationCodeExpiresInSeconds) !== null && _a !== void 0 ? _a : DEFAULT_AUTHORIZATION_CODE_EXPIRES_IN;
    }
    /**
     * The time after which an access token will expire.
     *
     * @default 360 (5 minutes)
     */
    get accessTokenExpiresInSeconds() {
        var _a;
        return (_a = this.options.accessTokenExpiresInSeconds) !== null && _a !== void 0 ? _a : DEFAULT_TOKEN_EXPIRES_IN;
    }
    /**
     * Whether DPoP is required for all issuance sessions. This value can be overridden when creating
     * a credential offer. If dpop is not required, but used by a client in the first request to credo,
     * DPoP will be required going forward.
     *
     * @default false
     */
    get dpopRequired() {
        var _a;
        return (_a = this.options.dpopRequired) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * Whether to allow dynamic issuance sessions based on a credential request.
     *
     * This requires an external authorization server which issues access tokens without
     * a `pre-authorized_code` or `issuer_state` parameter.
     *
     * Credo only supports statefull crednetial offer sessions (pre-auth or presentation during issuance)
     *
     * @default false
     */
    get allowDynamicIssuanceSessions() {
        var _a;
        return (_a = this.options.allowDynamicIssuanceSessions) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * @default /nonce
     */
    get nonceEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.nonce) !== null && _b !== void 0 ? _b : '/nonce';
    }
    /**
     * @default /challenge
     */
    get authorizationChallengeEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.authorizationChallenge) !== null && _b !== void 0 ? _b : '/challenge';
    }
    /**
     * @default /offers
     */
    get credentialOfferEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.credentialOffer) !== null && _b !== void 0 ? _b : '/offers';
    }
    /**
     * @default /credential
     */
    get credentialEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.credential) !== null && _b !== void 0 ? _b : '/credential';
    }
    /**
     * @default /token
     */
    get accessTokenEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.accessToken) !== null && _b !== void 0 ? _b : '/token';
    }
    /**
     * @default /jwks
     */
    get jwksEndpointPath() {
        var _a, _b;
        return (_b = (_a = this.options.endpoints) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : '/jwks';
    }
}
exports.OpenId4VcIssuerModuleConfig = OpenId4VcIssuerModuleConfig;
//# sourceMappingURL=OpenId4VcIssuerModuleConfig.js.map