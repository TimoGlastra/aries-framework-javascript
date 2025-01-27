"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCredentialOfferEndpoint = configureCredentialOfferEndpoint;
const core_1 = require("@credo-ts/core");
const router_1 = require("../../shared/router");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const repository_1 = require("../repository");
function configureCredentialOfferEndpoint(router, config) {
    router.get((0, core_1.joinUriParts)(config.credentialOfferEndpointPath, [':credentialOfferId']), async (request, response, next) => {
        const { agentContext, issuer } = (0, router_1.getRequestContext)(request);
        if (!request.params.credentialOfferId || typeof request.params.credentialOfferId !== 'string') {
            return (0, router_1.sendErrorResponse)(response, next, agentContext.config.logger, 400, 'invalid_request', 'Invalid credential offer url');
        }
        try {
            const issuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
            const issuerMetadata = await issuerService.getIssuerMetadata(agentContext, issuer);
            const openId4VcIssuanceSessionRepository = agentContext.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
            const fullCredentialOfferUri = (0, core_1.joinUriParts)(issuerMetadata.credentialIssuer.credential_issuer, [
                config.credentialOfferEndpointPath,
                request.params.credentialOfferId,
            ]);
            const openId4VcIssuanceSession = await openId4VcIssuanceSessionRepository.findSingleByQuery(agentContext, {
                issuerId: issuer.issuerId,
                credentialOfferUri: fullCredentialOfferUri,
            });
            if (!openId4VcIssuanceSession) {
                return (0, router_1.sendNotFoundResponse)(response, next, agentContext.config.logger, 'Credential offer not found');
            }
            if (openId4VcIssuanceSession.state !== OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferCreated &&
                openId4VcIssuanceSession.state !== OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved) {
                return (0, router_1.sendNotFoundResponse)(response, next, agentContext.config.logger, 'Invalid state for credential offer');
            }
            // It's okay to retrieve the offer multiple times. So we only update the state if it's not already retrieved
            if (openId4VcIssuanceSession.state !== OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved) {
                await issuerService.updateState(agentContext, openId4VcIssuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.OfferUriRetrieved);
            }
            return (0, router_1.sendJsonResponse)(response, next, openId4VcIssuanceSession.credentialOfferPayload);
        }
        catch (error) {
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, error);
        }
    });
}
//# sourceMappingURL=credentialOfferEndpoint.js.map