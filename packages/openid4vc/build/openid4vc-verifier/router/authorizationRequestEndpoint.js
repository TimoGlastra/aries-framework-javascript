"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthorizationRequestEndpoint = configureAuthorizationRequestEndpoint;
const core_1 = require("@credo-ts/core");
const router_1 = require("../../shared/router");
const OpenId4VcSiopVerifierService_1 = require("../OpenId4VcSiopVerifierService");
const OpenId4VcVerificationSessionState_1 = require("../OpenId4VcVerificationSessionState");
const OpenId4VcVerifierEvents_1 = require("../OpenId4VcVerifierEvents");
const OpenId4VcVerifierModuleConfig_1 = require("../OpenId4VcVerifierModuleConfig");
const repository_1 = require("../repository");
function configureAuthorizationRequestEndpoint(router, config) {
    router.get((0, core_1.joinUriParts)(config.endpointPath, [':authorizationRequestId']), async (request, response, next) => {
        const { agentContext, verifier } = (0, router_1.getRequestContext)(request);
        if (!request.params.authorizationRequestId || typeof request.params.authorizationRequestId !== 'string') {
            return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, 'invalid_request', 'Invalid authorization request url');
        }
        try {
            const verifierService = agentContext.dependencyManager.resolve(OpenId4VcSiopVerifierService_1.OpenId4VcSiopVerifierService);
            const verificationSessionRepository = agentContext.dependencyManager.resolve(repository_1.OpenId4VcVerificationSessionRepository);
            const verifierConfig = agentContext.dependencyManager.resolve(OpenId4VcVerifierModuleConfig_1.OpenId4VcVerifierModuleConfig);
            // We always use shortened URIs currently
            const fullAuthorizationRequestUri = (0, core_1.joinUriParts)(verifierConfig.baseUrl, [
                verifier.verifierId,
                verifierConfig.authorizationRequestEndpoint.endpointPath,
                request.params.authorizationRequestId,
            ]);
            const [verificationSession] = await verifierService.findVerificationSessionsByQuery(agentContext, {
                verifierId: verifier.verifierId,
                authorizationRequestUri: fullAuthorizationRequestUri,
            });
            if (!verificationSession) {
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 404, 'not_found', 'Authorization request not found');
            }
            if (![
                OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestCreated,
                OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved,
            ].includes(verificationSession.state)) {
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, 'invalid_request', 'Invalid state for authorization request');
            }
            // It's okay to retrieve the offer multiple times. So we only update the state if it's not already retrieved
            if (verificationSession.state !== OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved) {
                const previousState = verificationSession.state;
                verificationSession.state = OpenId4VcVerificationSessionState_1.OpenId4VcVerificationSessionState.RequestUriRetrieved;
                await verificationSessionRepository.update(agentContext, verificationSession);
                agentContext.dependencyManager
                    .resolve(core_1.EventEmitter)
                    .emit(agentContext, {
                    type: OpenId4VcVerifierEvents_1.OpenId4VcVerifierEvents.VerificationSessionStateChanged,
                    payload: {
                        verificationSession: verificationSession.clone(),
                        previousState,
                    },
                });
            }
            response.status(200).send(verificationSession.authorizationRequestJwt);
        }
        catch (error) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 500, 'invalid_request', error);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
}
//# sourceMappingURL=authorizationRequestEndpoint.js.map