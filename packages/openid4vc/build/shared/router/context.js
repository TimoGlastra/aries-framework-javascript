"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUnauthorizedError = sendUnauthorizedError;
exports.sendOauth2ErrorResponse = sendOauth2ErrorResponse;
exports.sendUnknownServerErrorResponse = sendUnknownServerErrorResponse;
exports.sendNotFoundResponse = sendNotFoundResponse;
exports.sendErrorResponse = sendErrorResponse;
exports.sendJsonResponse = sendJsonResponse;
exports.getRequestContext = getRequestContext;
const oauth2_1 = require("@animo-id/oauth2");
const core_1 = require("@credo-ts/core");
function sendUnauthorizedError(response, next, logger, error, status) {
    const errorMessage = error instanceof Error ? error.message : error;
    logger.warn(`[OID4VC] Sending authorization error response: ${JSON.stringify(errorMessage)}`, {
        error,
    });
    const unauhorizedError = error instanceof oauth2_1.Oauth2ResourceUnauthorizedError
        ? error
        : new oauth2_1.Oauth2ResourceUnauthorizedError('Unknown error occured', [
            { scheme: oauth2_1.SupportedAuthenticationScheme.DPoP },
            { scheme: oauth2_1.SupportedAuthenticationScheme.Bearer },
        ]);
    response
        .setHeader('WWW-Authenticate', unauhorizedError.toHeaderValue())
        .status(status !== null && status !== void 0 ? status : 403)
        .send();
    next(error);
}
function sendOauth2ErrorResponse(response, next, logger, error) {
    logger.warn(`[OID4VC] Sending oauth2 error response: ${JSON.stringify(error.message)}`, {
        error,
    });
    response.status(error.status).json(error.errorResponse);
    next(error);
}
function sendUnknownServerErrorResponse(response, next, logger, error) {
    logger.error(`[OID4VC] Sending unknown server error response`, {
        error,
    });
    response.status(500).json({
        error: 'server_error',
    });
    const throwError = error instanceof Error ? error : new core_1.CredoError('Unknown error in openid4vc error response handler');
    next(throwError);
}
function sendNotFoundResponse(response, next, logger, internalReason) {
    logger.debug(`[OID4VC] Sending not found response: ${internalReason}`);
    response.status(404).send();
    next(new core_1.CredoError(internalReason));
}
function sendErrorResponse(response, next, logger, status, message, error, additionalPayload) {
    const body = Object.assign(Object.assign({ error: message }, (error instanceof Error && { cause: error.message })), additionalPayload);
    logger.warn(`[OID4VC] Sending error response: ${JSON.stringify(body)}`, {
        error,
    });
    response.status(status).json(body);
    const throwError = error instanceof Error ? error : new core_1.CredoError('Unknown error in openid4vc error response handler');
    next(throwError);
}
function sendJsonResponse(response, next, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
body, contentType, status) {
    response
        .setHeader('Content-Type', contentType !== null && contentType !== void 0 ? contentType : 'application/json')
        .status(status !== null && status !== void 0 ? status : 200)
        .send(JSON.stringify(body));
    next();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRequestContext(request) {
    const requestContext = request.requestContext;
    if (!requestContext)
        throw new core_1.CredoError('Request context not set.');
    return requestContext;
}
//# sourceMappingURL=context.js.map