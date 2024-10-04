"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenId4VcHolderApi = void 0;
const core_1 = require("@credo-ts/core");
const OpenId4VciHolderService_1 = require("./OpenId4VciHolderService");
const OpenId4vcSiopHolderService_1 = require("./OpenId4vcSiopHolderService");
/**
 * @public
 */
let OpenId4VcHolderApi = class OpenId4VcHolderApi {
    constructor(agentContext, openId4VciHolderService, openId4VcSiopHolderService) {
        this.agentContext = agentContext;
        this.openId4VciHolderService = openId4VciHolderService;
        this.openId4VcSiopHolderService = openId4VcSiopHolderService;
    }
    /**
     * Resolves the authentication request given as URI or JWT to a unified format, and
     * verifies the validity of the request.
     *
     * The resolved request can be accepted with the @see acceptSiopAuthorizationRequest.
     *
     * If the authorization request uses OpenID4VP and included presentation definitions,
     * a `presentationExchange` property will be defined with credentials that satisfy the
     * incoming request. When `presentationExchange` is present, you MUST supply `presentationExchange`
     * when calling `acceptSiopAuthorizationRequest` as well.
     *
     * @param requestJwtOrUri JWT or an SIOPv2 request URI
     * @returns the resolved and verified authentication request.
     */
    async resolveSiopAuthorizationRequest(requestJwtOrUri) {
        return this.openId4VcSiopHolderService.resolveAuthorizationRequest(this.agentContext, requestJwtOrUri);
    }
    /**
     * Accepts the authentication request after it has been resolved and verified with {@link resolveSiopAuthorizationRequest}.
     *
     * If the resolved authorization request included a `presentationExchange` property, you MUST supply `presentationExchange`
     * in the `options` parameter.
     *
     * If no `presentationExchange` property is present, you MUST supply `openIdTokenIssuer` in the `options` parameter.
     */
    async acceptSiopAuthorizationRequest(options) {
        return await this.openId4VcSiopHolderService.acceptAuthorizationRequest(this.agentContext, options);
    }
    /**
     * Resolves a credential offer given as credential offer URL, or issuance initiation URL,
     * into a unified format with metadata.
     *
     * @param credentialOffer the credential offer to resolve
     * @returns The uniform credential offer payload, the issuer metadata, protocol version, and the offered credentials with metadata.
     */
    async resolveCredentialOffer(credentialOffer) {
        return await this.openId4VciHolderService.resolveCredentialOffer(this.agentContext, credentialOffer);
    }
    /**
     * This function is to be used to receive an credential in OpenID4VCI using the Authorization Code Flow.
     *
     * Not to be confused with the {@link resolveSiopAuthorizationRequest}, which is only used for SIOP requests.
     *
     * It will generate the authorization request URI based on the provided options.
     * The authorization request URI is used to obtain the authorization code. Currently this needs to be done manually.
     *
     * Authorization to request credentials can be requested via authorization_details or scopes.
     * This function automatically generates the authorization_details for all offered credentials.
     * If scopes are provided, the provided scopes are sent alongside the authorization_details.
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param authCodeFlowOptions
     * @returns The authorization request URI alongside the code verifier and original @param authCodeFlowOptions
     */
    async resolveIssuanceAuthorizationRequest(resolvedCredentialOffer, authCodeFlowOptions) {
        return await this.openId4VciHolderService.resolveAuthorizationRequest(this.agentContext, resolvedCredentialOffer, authCodeFlowOptions);
    }
    /**
     * Accepts a credential offer using the pre-authorized code flow.
     * @deprecated use @see requestToken and @see requestCredentials instead
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param acceptCredentialOfferOptions
     */
    async acceptCredentialOfferUsingPreAuthorizedCode(resolvedCredentialOffer, acceptCredentialOfferOptions) {
        const credentialResponse = await this.openId4VciHolderService.acceptCredentialOffer(this.agentContext, {
            resolvedCredentialOffer,
            acceptCredentialOfferOptions,
        });
        return credentialResponse.map((credentialResponse) => typeof credentialResponse === 'string' ? credentialResponse : credentialResponse.credential);
    }
    /**
     * Accepts a credential offer using the authorization code flow.
     * @deprecated use @see requestToken and @see requestCredentials instead
     *
     * @param resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param resolvedAuthorizationRequest Obtained through @see resolveIssuanceAuthorizationRequest
     * @param code The authorization code obtained via the authorization request URI
     * @param acceptCredentialOfferOptions
     */
    async acceptCredentialOfferUsingAuthorizationCode(resolvedCredentialOffer, resolvedAuthorizationRequest, code, acceptCredentialOfferOptions) {
        const credentialResponse = await this.openId4VciHolderService.acceptCredentialOffer(this.agentContext, {
            resolvedCredentialOffer,
            resolvedAuthorizationRequestWithCode: Object.assign(Object.assign({}, resolvedAuthorizationRequest), { code }),
            acceptCredentialOfferOptions,
        });
        return credentialResponse.map((credentialResponse) => typeof credentialResponse === 'string' ? credentialResponse : credentialResponse.credential);
    }
    /**
     * Requests the token to be used for credential requests.
     *
     * @param options.resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param options.userPin The user's PIN
     * @param options.resolvedAuthorizationRequest Obtained through @see resolveIssuanceAuthorizationRequest
     * @param options.code The authorization code obtained via the authorization request URI
     */
    async requestToken(options) {
        const { access_token: accessToken, c_nonce: cNonce, dpop, } = await this.openId4VciHolderService.requestAccessToken(this.agentContext, options);
        return { accessToken, cNonce, dpop };
    }
    /**
     * Request a credential. Can be used with both the pre-authorized code flow and the authorization code flow.
     *
     * @param options.resolvedCredentialOffer Obtained through @see resolveCredentialOffer
     * @param options.tokenResponse Obtained through @see requestAccessToken
     */
    async requestCredentials(options) {
        const { resolvedCredentialOffer, cNonce, accessToken, dpop, clientId, additionalProofOfPossessionPayloadClaims, additionalCredentialRequestPayloadClaims, customFormat, popCallback, getCreateJwtCallback, customBody, skipSdJwtVcValidation } = options, credentialRequestOptions = __rest(options, ["resolvedCredentialOffer", "cNonce", "accessToken", "dpop", "clientId", "additionalProofOfPossessionPayloadClaims", "additionalCredentialRequestPayloadClaims", "customFormat", "popCallback", "getCreateJwtCallback", "customBody", "skipSdJwtVcValidation"]);
        return this.openId4VciHolderService.acceptCredentialOffer(this.agentContext, {
            resolvedCredentialOffer,
            acceptCredentialOfferOptions: credentialRequestOptions,
            accessToken,
            cNonce,
            dpop,
            clientId,
            additionalCredentialRequestPayloadClaims,
            additionalProofOfPossessionPayloadClaims,
            customFormat,
            popCallback,
            getCreateJwtCallback,
            customBody,
            skipSdJwtVcValidation
        });
    }
    /**
     * Send a notification event to the credential issuer
     *
     * @param options OpenId4VciSendNotificationOptions
     */
    async sendNotification(options) {
        return this.openId4VciHolderService.sendNotification(options);
    }
};
exports.OpenId4VcHolderApi = OpenId4VcHolderApi;
exports.OpenId4VcHolderApi = OpenId4VcHolderApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.AgentContext,
        OpenId4VciHolderService_1.OpenId4VciHolderService,
        OpenId4vcSiopHolderService_1.OpenId4VcSiopHolderService])
], OpenId4VcHolderApi);
//# sourceMappingURL=OpenId4VcHolderApi.js.map