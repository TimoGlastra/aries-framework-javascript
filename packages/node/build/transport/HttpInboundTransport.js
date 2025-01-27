"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransportSession = exports.HttpInboundTransport = void 0;
const core_1 = require("@credo-ts/core");
const express_1 = __importStar(require("express"));
const rxjs_1 = require("rxjs");
const supportedContentTypes = [core_1.DidCommMimeType.V0, core_1.DidCommMimeType.V1];
class HttpInboundTransport {
    get server() {
        return this._server;
    }
    constructor({ app, path, port, processedMessageListenerTimeoutMs, }) {
        this.port = port;
        this.processedMessageListenerTimeoutMs = processedMessageListenerTimeoutMs !== null && processedMessageListenerTimeoutMs !== void 0 ? processedMessageListenerTimeoutMs : 10000; // timeout after 10 seconds
        // Create Express App
        this.app = app !== null && app !== void 0 ? app : (0, express_1.default)();
        this.path = path !== null && path !== void 0 ? path : '/';
        this.app.use((0, express_1.text)({ type: supportedContentTypes, limit: '5mb' }));
    }
    async start(agent) {
        const transportService = agent.dependencyManager.resolve(core_1.TransportService);
        agent.config.logger.debug(`Starting HTTP inbound transport`, {
            port: this.port,
        });
        this.app.post(this.path, async (req, res) => {
            const contentType = req.headers['content-type'];
            if (!contentType || !supportedContentTypes.includes(contentType)) {
                return res
                    .status(415)
                    .send('Unsupported content-type. Supported content-types are: ' + supportedContentTypes.join(', '));
            }
            const session = new HttpTransportSession(core_1.utils.uuid(), req, res);
            // We want to make sure the session is removed if the connection is closed, as it
            // can't be used anymore then. This could happen if the client abruptly closes the connection.
            req.once('close', () => transportService.removeSession(session));
            try {
                const message = req.body;
                const encryptedMessage = JSON.parse(message);
                const observable = agent.events.observable(core_1.AgentEventTypes.AgentMessageProcessed);
                const subject = new rxjs_1.ReplaySubject(1);
                observable
                    .pipe((0, rxjs_1.filter)((e) => e.type === core_1.AgentEventTypes.AgentMessageProcessed), (0, rxjs_1.filter)((e) => e.payload.encryptedMessage === encryptedMessage), (0, rxjs_1.timeout)({
                    first: this.processedMessageListenerTimeoutMs,
                    meta: 'HttpInboundTransport.start',
                }))
                    .subscribe(subject);
                agent.events.emit(agent.context, {
                    type: core_1.AgentEventTypes.AgentMessageReceived,
                    payload: {
                        message: encryptedMessage,
                        session: session,
                    },
                });
                // Wait for message to be processed
                await (0, rxjs_1.firstValueFrom)(subject);
                // If agent did not use session when processing message we need to send response here.
                if (!res.headersSent) {
                    res.status(200).end();
                }
            }
            catch (error) {
                agent.config.logger.error(`Error processing inbound message: ${error.message}`, error);
                if (!res.headersSent) {
                    res.status(500).send('Error processing message');
                }
            }
            finally {
                transportService.removeSession(session);
            }
        });
        this._server = this.app.listen(this.port);
    }
    async stop() {
        return new Promise((resolve, reject) => { var _a; return (_a = this._server) === null || _a === void 0 ? void 0 : _a.close((err) => (err ? reject(err) : resolve())); });
    }
}
exports.HttpInboundTransport = HttpInboundTransport;
class HttpTransportSession {
    constructor(id, req, res) {
        this.type = 'http';
        this.id = id;
        this.req = req;
        this.res = res;
    }
    async close() {
        if (!this.res.headersSent) {
            this.res.status(200).end();
        }
    }
    async send(agentContext, encryptedMessage) {
        if (this.res.headersSent) {
            throw new core_1.CredoError(`${this.type} transport session has been closed.`);
        }
        // By default we take the agent config's default DIDComm content-type
        let responseMimeType = agentContext.config.didCommMimeType;
        // However, if the request mime-type is a mime-type that is supported by us, we use that
        // to minimize the chance of interoperability issues
        const requestMimeType = this.req.headers['content-type'];
        if (requestMimeType && supportedContentTypes.includes(requestMimeType)) {
            responseMimeType = requestMimeType;
        }
        this.res.status(200).contentType(responseMimeType).json(encryptedMessage).end();
    }
}
exports.HttpTransportSession = HttpTransportSession;
//# sourceMappingURL=HttpInboundTransport.js.map