"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCredentialOfferEndpoint = configureCredentialOfferEndpoint;
const core_1 = require("@credo-ts/core");
const router_1 = require("../../shared/router");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerEvents_1 = require("../OpenId4VcIssuerEvents");
const OpenId4VcIssuerModuleConfig_1 = require("../OpenId4VcIssuerModuleConfig");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const repository_1 = require("../repository");
function configureCredentialOfferEndpoint(router, config) {
    router.get((0, core_1.joinUriParts)(config.endpointPath, [':credentialOfferId']), async (request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(request);
        if (!request.params.credentialOfferId || typeof request.params.credentialOfferId !== 'string') {
            return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, 'invalid_request', 'Invalid credential offer url');
        }
        try {
            const issuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const issuerMetadata = issuerService.getIssuerMetadata(agentContext, issuer);
            const openId4VcIssuanceSessionRepository = agentContext.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
            const issuerConfig = agentContext.dependencyManager.resolve(OpenId4VcIssuerModuleConfig_1.OpenId4VcIssuerModuleConfig);
            const fullCredentialOfferUri = (0, core_1.joinUriParts)(issuerMetadata.issuerUrl, [
                issuerConfig.credentialOfferEndpoint.endpointPath,
                request.params.credentialOfferId,
            ]);
            const openId4VcIssuanceSession = await openId4VcIssuanceSessionRepository.findSingleByQuery(agentContext, {
                issuerId: issuer.issuerId,
                credentialOfferUri: fullCredentialOfferUri,
            });
            if (!openId4VcIssuanceSession || !openId4VcIssuanceSession.credentialOfferPayload) {
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 404, 'not_found', 'Credential offer not found');
            }
            if (![OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved].includes(openId4VcIssuanceSession.state)) {
                return (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 400, 'invalid_request', 'Invalid state for credential offer');
            }
            // It's okay to retrieve the offer multiple times. So we only update the state if it's not already retrieved
            if (openId4VcIssuanceSession.state !== OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved) {
                const previousState = openId4VcIssuanceSession.state;
                openId4VcIssuanceSession.state = OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved;
                await openId4VcIssuanceSessionRepository.update(agentContext, openId4VcIssuanceSession);
                agentContext.dependencyManager
                    .resolve(core_1.EventEmitter)
                    .emit(agentContext, {
                    type: OpenId4VcIssuerEvents_1.OpenId4VcIssuerEvents.IssuanceSessionStateChanged,
                    payload: {
                        issuanceSession: openId4VcIssuanceSession.clone(),
                        previousState,
                    },
                });
            }
            response.json(openId4VcIssuanceSession.credentialOfferPayload);
        }
        catch (error) {
            (0, router_1.sendErrorResponse)(response, agentContext.config.logger, 500, 'invalid_request', error);
        }
        // NOTE: if we don't call next, the agentContext session handler will NOT be called
        next();
    });
}
//# sourceMappingURL=credentialOfferEndpoint.js.map