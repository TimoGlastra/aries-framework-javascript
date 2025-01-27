"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthorizationEndpoint = configureAuthorizationEndpoint;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const router_1 = require("../../shared/router");
const OpenId4VcSiopVerifierService_1 = require("../OpenId4VcSiopVerifierService");
async function getVerificationSession(agentContext, options) {
    const { verifierId, state, nonce } = options;
    const openId4VcVerifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
    const session = await openId4VcVerifierService.findVerificationSessionForAuthorizationResponse(agentContext, {
        authorizationResponseParams: { state, nonce },
        verifierId,
    });
    if (!session) {
        agentContext.config.logger.warn(`No verification session found for incoming authorization response for verifier ${verifierId}`);
        throw new core_1.CredoError(`No state or nonce provided in authorization response for verifier ${verifierId}`);
    }
    return session;
}
const decryptJarmResponse = (agentContext) => {
    return async (input) => {
        const { jwe: compactJwe, jwk: jwkJson } = input;
        const key = core_1.Key.fromFingerprint(jwkJson.kid);
        if (!agentContext.wallet.directDecryptCompactJweEcdhEs) {
            throw new core_1.CredoError('Cannot decrypt Jarm Response, wallet does not support directDecryptCompactJweEcdhEs');
        }
        const { data, header } = await agentContext.wallet.directDecryptCompactJweEcdhEs({ compactJwe, recipientKey: key });
        const decryptedPayload = core_1.TypedArrayEncoder.toUtf8String(data);
        return {
            plaintext: decryptedPayload,
            protectedHeader: header,
        };
    };
};
function configureAuthorizationEndpoint(router, config) {
    router.post(config.endpointPath, async (request, response, next) => {
        const { agentContext, verifier } = (0, router_1.getRequestContext)(request);
        let jarmResponseType;
        try {
            const openId4VcVerifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
            let verificationSession;
            let authorizationResponsePayload;
            let jarmHeader = undefined;
            if (request.body.response) {
                const res = await did_auth_siop_1.RP.processJarmAuthorizationResponse(request.body.response, {
                    getAuthRequestPayload: async (input) => {
                        var _a;
                        verificationSession = await getVerificationSession(agentContext, {
                            verifierId: verifier.verifierId,
                            state: input.state,
                            nonce: input.nonce,
                        });
                        const req = await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(verificationSession.authorizationRequestJwt);
                        const requestObjectPayload = await ((_a = req.requestObject) === null || _a === void 0 ? void 0 : _a.getPayload());
                        if (!requestObjectPayload) {
                            throw new core_1.CredoError('No request object payload found.');
                        }
                        return { authRequestParams: requestObjectPayload };
                    },
                    decryptCompact: decryptJarmResponse(agentContext),
                    hasher: core_1.Hasher.hash,
                });
                jarmResponseType = res.type;
                const [header] = request.body.response.split('.');
                jarmHeader = core_1.JsonEncoder.fromBase64(header);
                // FIXME: verify the apv matches the nonce of the authorization reuqest
                authorizationResponsePayload = res.authResponseParams;
            }
            else {
                authorizationResponsePayload = request.body;
                verificationSession = await getVerificationSession(agentContext, {
                    verifierId: verifier.verifierId,
                    state: authorizationResponsePayload.state,
                    nonce: authorizationResponsePayload.nonce,
                });
            }
            if (typeof authorizationResponsePayload.presentation_submission === 'string') {
                authorizationResponsePayload.presentation_submission = JSON.parse(request.body.presentation_submission);
            }
            // This feels hacky, and should probably be moved to OID4VP lib. However the OID4VP spec allows either object, string, or array...
            if (typeof authorizationResponsePayload.vp_token === 'string' &&
                (authorizationResponsePayload.vp_token.startsWith('{') || authorizationResponsePayload.vp_token.startsWith('['))) {
                authorizationResponsePayload.vp_token = JSON.parse(authorizationResponsePayload.vp_token);
            }
            if (!verificationSession) {
                throw new core_1.CredoError('Missing verification session, cannot verify authorization response.');
            }
            const authorizationRequest = await did_auth_siop_1.AuthorizationRequest.fromUriOrJwt(verificationSession.authorizationRequestJwt);
            const response_mode = await authorizationRequest.getMergedProperty('response_mode');
            if ((response_mode === null || response_mode === void 0 ? void 0 : response_mode.includes('jwt')) && !jarmResponseType) {
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidRequest,
                    error_description: `JARM response is required for JWT response mode '${response_mode}'.`,
                });
            }
            if (!(response_mode === null || response_mode === void 0 ? void 0 : response_mode.includes('jwt')) && jarmResponseType) {
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidRequest,
                    error_description: `Recieved JARM response which is incompatible with response mode '${response_mode}'.`,
                });
            }
            if (jarmResponseType && jarmResponseType !== 'encrypted') {
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.InvalidRequest,
                    error_description: `Only encrypted JARM responses are supported, received '${jarmResponseType}'.`,
                });
            }
            await openId4VcVerifierService.verifyAuthorizationResponse(agentContext, {
                authorizationResponse: authorizationResponsePayload,
                verificationSession,
                jarmHeader,
            });
            return (0, router_1.sendJsonResponse)(response, next, {
                // Used only for presentation during issuance flow, to prevent session fixation.
                presentation_during_issuance_session: verificationSession.presentationDuringIssuanceSession,
            });
        }
        catch (error) {
            if (error instanceof oauth2_1.Oauth2ServerErrorResponseError) {
                return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, error);
            }
            return (0, router_1.sendErrorResponse)(response, next, agentContext.config.logger, 500, 'invalid_request', error);
        }
    });
}
//# sourceMappingURL=authorizationEndpoint.js.map