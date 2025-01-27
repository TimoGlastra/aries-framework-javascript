"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCredentialEndpoint = configureCredentialEndpoint;
const oauth2_1 = require("@animo-id/oauth2");
const oid4vci_1 = require("@animo-id/oid4vci");
const core_1 = require("@credo-ts/core");
const shared_1 = require("../../shared");
const router_1 = require("../../shared/router");
const utils_1 = require("../../shared/utils");
const OpenId4VcIssuanceSessionState_1 = require("../OpenId4VcIssuanceSessionState");
const OpenId4VcIssuerService_1 = require("../OpenId4VcIssuerService");
const repository_1 = require("../repository");
function configureCredentialEndpoint(router, config) {
    router.post(config.credentialEndpointPath, async (request, response, next) => {
        var _a, _b, _c;
        const { agentContext, issuer } = (0, router_1.getRequestContext)(request);
        const openId4VcIssuerService = agentContext.dependencyManager.resolve(OpenId4VcIssuerService_1.OpenId4VcIssuerService);
        const issuerMetadata = await openId4VcIssuerService.getIssuerMetadata(agentContext, issuer, true);
        const vcIssuer = openId4VcIssuerService.getIssuer(agentContext);
        const resourceServer = openId4VcIssuerService.getResourceServer(agentContext, issuer);
        const fullRequestUrl = (0, core_1.joinUriParts)(issuerMetadata.credentialIssuer.credential_issuer, [
            config.credentialEndpointPath,
        ]);
        const resourceRequestResult = await resourceServer
            .verifyResourceRequest({
            authorizationServers: issuerMetadata.authorizationServers,
            resourceServer: issuerMetadata.credentialIssuer.credential_issuer,
            allowedAuthenticationSchemes: config.dpopRequired ? [oauth2_1.SupportedAuthenticationScheme.DPoP] : undefined,
            request: {
                headers: new Headers(request.headers),
                method: request.method,
                url: fullRequestUrl,
            },
        })
            .catch((error) => {
            (0, router_1.sendUnauthorizedError)(response, next, agentContext.config.logger, error);
        });
        if (!resourceRequestResult)
            return;
        const { tokenPayload, accessToken, scheme, authorizationServer } = resourceRequestResult;
        const credentialRequest = request.body;
        const issuanceSessionRepository = agentContext.dependencyManager.resolve(repository_1.OpenId4VcIssuanceSessionRepository);
        const parsedCredentialRequest = vcIssuer.parseCredentialRequest({
            credentialRequest,
        });
        let issuanceSession = null;
        const preAuthorizedCode = typeof tokenPayload['pre-authorized_code'] === 'string' ? tokenPayload['pre-authorized_code'] : undefined;
        const issuerState = typeof tokenPayload.issuer_state === 'string' ? tokenPayload.issuer_state : undefined;
        const subject = tokenPayload.sub;
        if (!subject) {
            return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.ServerError,
            }, {
                internalMessage: `Received token without 'sub' claim. Subject is required for binding issuance session`,
            }));
        }
        // Already handle request without format. Simplifies next code sections
        if (!parsedCredentialRequest.format) {
            return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ServerErrorResponseError({
                error: parsedCredentialRequest.credentialIdentifier
                    ? oauth2_1.Oauth2ErrorCodes.InvalidCredentialRequest
                    : oauth2_1.Oauth2ErrorCodes.UnsupportedCredentialFormat,
                error_description: parsedCredentialRequest.credentialIdentifier
                    ? `Credential request containing 'credential_identifier' not supported`
                    : `Credential format '${parsedCredentialRequest.credentialRequest.format}' not supported`,
            }));
        }
        if (preAuthorizedCode || issuerState) {
            issuanceSession = await issuanceSessionRepository.findSingleByQuery(agentContext, {
                issuerId: issuer.issuerId,
                preAuthorizedCode,
                issuerState,
            });
            if (!issuanceSession) {
                agentContext.config.logger.warn(`No issuance session found for incoming credential request for issuer ${issuer.issuerId} but access token data has ${issuerState ? 'issuer_state' : 'pre-authorized_code'}. Returning error response`, {
                    tokenPayload,
                });
                return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ServerErrorResponseError({
                    error: oauth2_1.Oauth2ErrorCodes.CredentialRequestDenied,
                }, {
                    internalMessage: `No issuance session found for incoming credential request for issuer ${issuer.issuerId} and access token data`,
                }));
            }
            // Verify the issuance session subject
            if ((_a = issuanceSession.authorization) === null || _a === void 0 ? void 0 : _a.subject) {
                if (issuanceSession.authorization.subject !== tokenPayload.sub) {
                    return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ServerErrorResponseError({
                        error: oauth2_1.Oauth2ErrorCodes.CredentialRequestDenied,
                    }, {
                        internalMessage: `Issuance session authorization subject does not match with the token payload subject for issuance session '${issuanceSession.id}'. Returning error response`,
                    }));
                }
            }
            // Statefull session expired
            else if (Date.now() >
                (0, utils_1.addSecondsToDate)(issuanceSession.createdAt, config.statefullCredentialOfferExpirationInSeconds).getTime()) {
                issuanceSession.errorMessage = 'Credential offer has expired';
                await openId4VcIssuerService.updateState(agentContext, issuanceSession, OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.Error);
                throw new oauth2_1.Oauth2ServerErrorResponseError({
                    // What is the best error here?
                    error: oauth2_1.Oauth2ErrorCodes.CredentialRequestDenied,
                    error_description: 'Session expired',
                });
            }
            else {
                issuanceSession.authorization = Object.assign(Object.assign({}, issuanceSession.authorization), { subject: tokenPayload.sub });
                await issuanceSessionRepository.update(agentContext, issuanceSession);
            }
        }
        if (!issuanceSession && config.allowDynamicIssuanceSessions) {
            agentContext.config.logger.warn(`No issuance session found for incoming credential request for issuer ${issuer.issuerId} and access token data has no issuer_state or pre-authorized_code. Creating on-demand issuance session`, {
                tokenPayload,
            });
            // All credential configurations that match the request scope and credential request
            // This is just so we don't create an issuance session that will fail immediately after
            const credentialConfigurationsForToken = (0, oid4vci_1.getCredentialConfigurationsMatchingRequestFormat)({
                credentialConfigurations: (0, shared_1.getCredentialConfigurationsSupportedForScopes)(issuerMetadata.credentialIssuer.credential_configurations_supported, (_c = (_b = tokenPayload.scope) === null || _b === void 0 ? void 0 : _b.split(' ')) !== null && _c !== void 0 ? _c : []),
                requestFormat: parsedCredentialRequest.format,
            });
            if (Object.keys(credentialConfigurationsForToken).length === 0) {
                return (0, router_1.sendUnauthorizedError)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ResourceUnauthorizedError('No credential configurationss match credential request and access token scope', {
                    scheme,
                    error: oauth2_1.Oauth2ErrorCodes.InsufficientScope,
                }), 
                // Forbidden for InsufficientScope
                403);
            }
            issuanceSession = new repository_1.OpenId4VcIssuanceSessionRecord({
                credentialOfferPayload: {
                    credential_configuration_ids: Object.keys(credentialConfigurationsForToken),
                    credential_issuer: issuerMetadata.credentialIssuer.credential_issuer,
                },
                issuerId: issuer.issuerId,
                state: OpenId4VcIssuanceSessionState_1.OpenId4VcIssuanceSessionState.CredentialRequestReceived,
                clientId: tokenPayload.client_id,
                authorization: {
                    subject: tokenPayload.sub,
                },
            });
            // Save and update
            await issuanceSessionRepository.save(agentContext, issuanceSession);
            openId4VcIssuerService.emitStateChangedEvent(agentContext, issuanceSession, null);
        }
        else if (!issuanceSession) {
            return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, new oauth2_1.Oauth2ServerErrorResponseError({
                error: oauth2_1.Oauth2ErrorCodes.CredentialRequestDenied,
            }, {
                internalMessage: `Access token without 'issuer_state' or 'pre-authorized_code' issued by external authorization server provided, but 'allowDynamicIssuanceSessions' is disabled. Either bind the access token to a statefull credential offer, or enable 'allowDynamicIssuanceSessions'.`,
            }));
        }
        try {
            const { credentialResponse } = await openId4VcIssuerService.createCredentialResponse(agentContext, {
                issuanceSession,
                credentialRequest,
                authorization: {
                    authorizationServer,
                    accessToken: {
                        payload: tokenPayload,
                        value: accessToken,
                    },
                },
            });
            return (0, router_1.sendJsonResponse)(response, next, credentialResponse);
        }
        catch (error) {
            if (error instanceof oauth2_1.Oauth2ServerErrorResponseError) {
                return (0, router_1.sendOauth2ErrorResponse)(response, next, agentContext.config.logger, error);
            }
            if (error instanceof oauth2_1.Oauth2ResourceUnauthorizedError) {
                return (0, router_1.sendUnauthorizedError)(response, next, agentContext.config.logger, error);
            }
            return (0, router_1.sendUnknownServerErrorResponse)(response, next, agentContext.config.logger, error);
        }
    });
}
//# sourceMappingURL=credentialEndpoint.js.map