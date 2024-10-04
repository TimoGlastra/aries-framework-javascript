"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = sendErrorResponse;
exports.getRequestContext = getRequestContext;
const core_1 = require("@credo-ts/core");
function sendErrorResponse(response, logger, code, message, error) {
    const error_description = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unknown error occurred.';
    const body = { error: message, error_description };
    logger.warn(`[OID4VCI] Sending error response: ${JSON.stringify(body)}`, {
        error,
    });
    return response.status(code).json(body);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRequestContext(request) {
    const requestContext = request.requestContext;
    if (!requestContext)
        throw new core_1.CredoError('Request context not set.');
    return requestContext;
}
//# sourceMappingURL=context.js.map