"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthorizationChallengeEndpoint = configureAuthorizationChallengeEndpoint;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
const openid4vc_verifier_1 = require("../../openid4vc-verifier");
const shared_1 = require("../../shared");
const router_1 = require("../../shared/router");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerModuleConfig_1 = require("../OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
function configureAuthorizationChallengeEndpoint(router, config) {
    router.post(config.authorizationChallengeEndpointPath, async (request, response, next) => {
        const requestContext = (0, router_1.getRequestContext)(request);
        const { agentContext, issuer } = requestContext;
        try {
            const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const authorizationServer = openId4VcIssuerService.getOauth2AuthorizationServer(agentContext);
            const { authorizationChallengeRequest } = authorizationServer.parseAuthorizationChallengeRequest({
                authorizationChallengeRequest: request.body,
            });
            if (authorizationChallengeRequest.auth_session) {
                await handleAuthorizationChallengeWithAuthSession({
                    response,
                    next,
                    authorizationChallengeRequest: Object.assign(Object.assign({}, authorizationChallengeRequest), { auth_session: authorizationChallengeRequest.auth_session }),
                    agentContext,
                    issuer,
                });
            }
            else {
                // First call, no auth_sesion yet
                await handleAuthorizationChallengeNoAuthSession({
                    authorizationChallengeRequest,
                    agentContext,
                    issuer,
                });
            }
        }
        catch (error) {
            if (error instanceof oauth2_1.Oauth2ServerErrorResponseError) {
                return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, error);
            }
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, error);
        }
    });
}
async function handleAuthorizationChallengeNoAuthSession(options) {
    const { agentContext, issuer, authorizationChallengeRequest } = options;
    // First call, no auth_sesion yet
    const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
    const config = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
    const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer);
    const authorizationServer = openId4VcIssuerService.getOauth2AuthorizationServer(agentContext);
    if (!config.getVerificationSessionForIssuanceSessionAuthorization) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.ServerError,
        }, {
            internalMessage: `Missing required 'getVerificationSessionForIssuanceSessionAuthorization' callback in openid4vc issuer module config. This callback is required for presentation during issuance flows.`,
        });
    }
    if (!authorizationChallengeRequest.scope) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidScope,
            error_description: `Missing required 'scope' parameter`,
        });
    }
    if (!authorizationChallengeRequest.issuer_state) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidRequest,
            error_description: `Missing required 'issuer_state' parameter. Only requests initiated by a credential offer are supported for authorization challenge.`,
        });
    }
    // FIXME: we need to authenticate the client. Could be either using client_id/client_secret
    // but that doesn't make sense for wallets. So for now we just allow any client_id and we will
    // need OAuth2 Attestation Based Client Auth and dynamically allow client_ids based on wallet providers
    // we trust. Will add this in a follow up PR (basically we do no client authentication at the moment)
    // if (!authorizationChallengeRequest.client_id) {
    //   throw new Oauth2ServerErrorResponseError({
    //     error: Oauth2ErrorCodes.InvalidRequest,
    //     error_description: `Missing required 'client_id' parameter..`,
    //   })
    // }
    const issuanceSession = await openId4VcIssuerService.findSingleIssuancSessionByQuery(agentContext, {
        issuerId: issuer.issuerId,
        issuerState: authorizationChallengeRequest.issuer_state,
    });
    const allowedStates = [OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved];
    if (!issuanceSession || !allowedStates.includes(issuanceSession.state)) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidRequest,
            error_description: `Invalid 'issuer_state' parameter`,
        }, {
            internalMessage: !issuanceSession
                ? `Issuance session not found for 'issuer_state' parameter '${authorizationChallengeRequest.issuer_state}'`
                : `Issuance session '${issuanceSession.id}' has state '${issuanceSession.state}' but expected one of ${allowedStates.join(', ')}`,
        });
    }
    const offeredCredentialConfigurations = (0, shared_1.getOfferedCredentials)(issuanceSession.credentialOfferPayload.credential_configuration_ids, issuerMetadata.credentialIssuer.credential_configurations_supported);
    const allowedScopes = (0, shared_1.getScopesFromCredentialConfigurationsSupported)(offeredCredentialConfigurations);
    const requestedScopes = (0, shared_1.getAllowedAndRequestedScopeValues)({
        allowedScopes,
        requestedScope: authorizationChallengeRequest.scope,
    });
    const requestedCredentialConfigurations = (0, shared_1.getCredentialConfigurationsSupportedForScopes)(offeredCredentialConfigurations, requestedScopes);
    if (requestedScopes.length === 0 || Object.keys(requestedCredentialConfigurations).length === 0) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidScope,
            error_description: `No requested 'scope' values match with offered credential configurations.`,
        });
    }
    const { authorizationRequest, verificationSession, scopes: presentationScopes, } = await config.getVerificationSessionForIssuanceSessionAuthorization({
        agentContext,
        issuanceSession,
        requestedCredentialConfigurations,
        scopes: requestedScopes,
    });
    // Store presentation during issuance session on the record
    verificationSession.presentationDuringIssuanceSession = core_1.TypedArrayEncoder.toBase64URL(agentContext.wallet.getRandomValues(32));
    await agentContext.dependencyManager
        .resolve(openid4vc_verifier_1.OpenId4VcVerificationSessionRepository)
        .update(agentContext, verificationSession);
    const authSession = core_1.TypedArrayEncoder.toBase64URL(agentContext.wallet.getRandomValues(32));
    issuanceSession.authorization = Object.assign(Object.assign({}, issuanceSession.authorization), { scopes: presentationScopes });
    issuanceSession.presentation = {
        required: true,
        authSession,
        openId4VcVerificationSessionId: verificationSession.id,
    };
    // NOTE: should only allow authenticated clients in the future.
    issuanceSession.clientId = authorizationChallengeRequest.client_id;
    await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AuthorizationInitiated);
    const authorizationChallengeErrorResponse = authorizationServer.createAuthorizationChallengePresentationErrorResponse({
        authSession,
        presentation: authorizationRequest,
        errorDescription: 'Presentation required before issuance',
    });
    throw new oauth2_1.Oauth2ServerErrorResponseError(authorizationChallengeErrorResponse);
}
async function handleAuthorizationChallengeWithAuthSession(options) {
    const { agentContext, issuer, authorizationChallengeRequest, response, next } = options;
    const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
    const config = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
    const authorizationServer = openId4VcIssuerService.getOauth2AuthorizationServer(agentContext);
    const verifierApi = agentContext.dependencyManager.resolve(openid4vc_verifier_1.OpenId4VcVerifierApi);
    // NOTE: we ignore scope, issuer_state etc.. parameters if auth_session is present
    // should we validate that these are not in the request? I'm not sure what best practive would be here
    const issuanceSession = await openId4VcIssuerService.findSingleIssuancSessionByQuery(agentContext, {
        issuerId: issuer.issuerId,
        presentationAuthSession: authorizationChallengeRequest.auth_session,
    });
    const allowedStates = [OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AuthorizationInitiated];
    if (!(issuanceSession === null || issuanceSession === void 0 ? void 0 : issuanceSession.presentation) ||
        !issuanceSession.presentation.openId4VcVerificationSessionId ||
        !issuanceSession.presentation.authSession ||
        !allowedStates.includes(issuanceSession.state)) {
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidSession,
            error_description: `Invalid 'auth_session'`,
        }, {
            internalMessage: !issuanceSession
                ? `Issuance session not found for 'auth_session' parameter '${authorizationChallengeRequest.auth_session}'`
                : !(issuanceSession === null || issuanceSession === void 0 ? void 0 : issuanceSession.presentation)
                    ? `Issuance session '${issuanceSession.id}' has no 'presentation'. This should not happen and means state is corrupted`
                    : `Issuance session '${issuanceSession.id}' has state '${issuanceSession.state}' but expected one of ${allowedStates.join(', ')}`,
        });
    }
    const { openId4VcVerificationSessionId } = issuanceSession.presentation;
    await verifierApi
        .getVerificationSessionById(openId4VcVerificationSessionId)
        .catch(async () => {
        // Issuance session is corrupted
        issuanceSession.errorMessage = `Associated openId4VcVeificationSessionRecord with id '${openId4VcVerificationSessionId}' does not exist`;
        await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error);
        throw new oauth2_1.Oauth2ServerErrorResponseError({
            error: oauth2_1.Oauth2ErrorCodes.InvalidSession,
            error_description: `Invalid 'auth_session'`,
        }, {
            internalMessage: `Openid4vc verification session with id '${openId4VcVerificationSessionId}' not found during issuance session with id '${issuanceSession.id}'`,
        });
    })
        .then(async (verificationSession) => {
        // Issuance session cannot be used anymore
        if (verificationSession.state === openid4vc_verifier_1.OpenId4VcVerificationSessionState.Error) {
            issuanceSession.errorMessage = `Associated openId4VcVerificationSessionRecord with id '${openId4VcVerificationSessionId}' has error state`;
            await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error);
        }
        if (verificationSession.state !== openid4vc_verifier_1.OpenId4VcVerificationSessionState.ResponseVerified ||
            authorizationChallengeRequest.presentation_during_issuance_session !==
                verificationSession.presentationDuringIssuanceSession) {
            throw new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.InvalidSession,
                error_description: `Invalid presentation for 'auth_session'`,
            }, {
                internalMessage: verificationSession.state !== openid4vc_verifier_1.OpenId4VcVerificationSessionState.ResponseVerified
                    ? `Openid4vc verification session with id '${openId4VcVerificationSessionId}' has state '${verificationSession.state}', while '${openid4vc_verifier_1.OpenId4VcVerificationSessionState.ResponseVerified}' was expected.`
                    : `Openid4vc verification session with id '${openId4VcVerificationSessionId}' has 'presentation_during_issuance_session' '${verificationSession.presentationDuringIssuanceSession}', but authorization challenge request provided value '${authorizationChallengeRequest.presentation_during_issuance_session}'.`,
            });
        }
    });
    // Grant authorization
    const authorizationCode = core_1.TypedArrayEncoder.toBase64URL(agentContext.wallet.getRandomValues(32));
    const authorizationCodeExpiresAt = (0, utils_1.addSecondsToDate)(new Date(), config.authorizationCodeExpiresInSeconds);
    issuanceSession.authorization = Object.assign(Object.assign({}, issuanceSession.authorization), { code: authorizationCode, codeExpiresAt: authorizationCodeExpiresAt });
    // TODO: we need to start using locks so we can't get corrupted state
    await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.AuthorizationGranted);
    const { authorizationChallengeResponse } = authorizationServer.createAuthorizationChallengeResponse({
        authorizationCode,
    });
    return (0, router_1.sendJsonResponse)(response, next, authorizationChallengeResponse);
}
//# sourceMappingURL=authorizationChallengeEndpoint.js.map