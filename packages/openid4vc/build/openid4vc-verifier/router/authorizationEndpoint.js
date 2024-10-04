"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthorizationEndpoint = configureAuthorizationEndpoint;
const core_1 = require("@credo-ts/core");
const did_auth_siop_1 = require("@sphereon/did-auth-siop");
const router_1 = require("../../shared/router");
const OpenId4VcSiopVerifierService_1 = require("../OpenId4VcSiopVerifierService");
async function getVerificationSession(agentContext, options) {
    const { verifierId, state, nonce } = options;
    const openId4VcVerifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
    const session = await openId4VcVerifierService.findVerificationSessionForAuthorizationResponse(agentContext, {
        authorizationResponseParams: { state, nonce: nonce },
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
        try {
            const openId4VcVerifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
            let verificationSession;
            let authorizationResponsePayload;
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
                });
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
                authorizationResponsePayload.presentation_submission = JSON.parse(authorizationResponsePayload.presentation_submission);
            }
            if (!verificationSession) {
                throw new core_1.CredoError('Missing verification session, cannot verify authorization response.');
            }
            let verifyHs256Callback = undefined;
            const parsedAuthorizationRequest = core_1.Jwt.fromSerializedJwt(verificationSession.authorizationRequestJwt);
            const rpEphPub = parsedAuthorizationRequest.payload.additionalClaims.rp_eph_pub;
            if (rpEphPub) {
                if (!config.getVerifyHs256Callback)
                    throw new Error('Expected getVerifyHs256Callback when receiving an rp_eph_pub');
                verifyHs256Callback = config.getVerifyHs256Callback(agentContext, rpEphPub);
            }
            await openId4VcVerifierService.verifyAuthorizationResponse(agentContext, {
                authorizationResponse: authorizationResponsePayload,
                verificationSession,
                verifyHs256Callback
            });
            response.status(200).send();
        }
        catch (error) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 500, 'invalid_request', error);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
}
//# sourceMappingURL=authorizationEndpoint.js.map