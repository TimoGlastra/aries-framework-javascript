"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrpcApi = void 0;
const core_1 = require("@credo-ts/core");
const handlers_1 = require("./handlers");
const models_1 = require("./models");
const services_1 = require("./services");
let DrpcApi = class DrpcApi {
    constructor(messageHandlerRegistry, drpcMessageService, messageSender, connectionService, agentContext) {
        this.drpcMessageService = drpcMessageService;
        this.messageSender = messageSender;
        this.connectionService = connectionService;
        this.agentContext = agentContext;
        this.registerMessageHandlers(messageHandlerRegistry);
    }
    /**
     * sends the request object to the connection and returns a function that will resolve to the response
     * @param connectionId the connection to send the request to
     * @param request the request object
     * @returns curried function that waits for the response with an optional timeout in seconds
     */
    async sendRequest(connectionId, request) {
        const connection = await this.connectionService.getById(this.agentContext, connectionId);
        const { requestMessage: drpcMessage, record: drpcMessageRecord } = await this.drpcMessageService.createRequestMessage(this.agentContext, request, connection.id);
        const messageId = drpcMessage.id;
        await this.sendMessage(connection, drpcMessage, drpcMessageRecord);
        return async (timeout) => {
            return await this.recvResponse(messageId, timeout);
        };
    }
    /**
     * Listen for a response that has a thread id matching the provided messageId
     * @param messageId the id to match the response to
     * @param timeoutMs the time in milliseconds to wait for a response
     * @returns the response object
     */
    async recvResponse(messageId, timeoutMs) {
        return new Promise((resolve) => {
            const listener = ({ drpcMessageRecord, removeListener, }) => {
                const response = drpcMessageRecord.response;
                if (drpcMessageRecord.threadId === messageId) {
                    removeListener();
                    resolve(response);
                }
            };
            const cancelListener = this.drpcMessageService.createResponseListener(listener);
            if (timeoutMs) {
                const handle = setTimeout(() => {
                    clearTimeout(handle);
                    cancelListener();
                    resolve(undefined);
                }, timeoutMs);
            }
        });
    }
    /**
     * Listen for a request and returns the request object and a function to send the response
     * @param timeoutMs the time in seconds to wait for a request
     * @returns the request object and a function to send the response
     */
    async recvRequest(timeoutMs) {
        return new Promise((resolve) => {
            const listener = ({ drpcMessageRecord, removeListener, }) => {
                const request = drpcMessageRecord.request;
                if (request && drpcMessageRecord.role === models_1.DrpcRole.Server) {
                    removeListener();
                    resolve({
                        sendResponse: async (response) => {
                            await this.sendResponse({
                                connectionId: drpcMessageRecord.connectionId,
                                threadId: drpcMessageRecord.threadId,
                                response,
                            });
                        },
                        request,
                    });
                }
            };
            const cancelListener = this.drpcMessageService.createRequestListener(listener);
            if (timeoutMs) {
                const handle = setTimeout(() => {
                    clearTimeout(handle);
                    cancelListener();
                    resolve(undefined);
                }, timeoutMs);
            }
        });
    }
    /**
     * Sends a drpc response to a connection
     * @param connectionId the connection id to use
     * @param threadId the thread id to respond to
     * @param response the drpc response object to send
     */
    async sendResponse(options) {
        const connection = await this.connectionService.getById(this.agentContext, options.connectionId);
        const drpcMessageRecord = await this.drpcMessageService.findByThreadAndConnectionId(this.agentContext, options.connectionId, options.threadId);
        if (!drpcMessageRecord) {
            throw new Error(`No request found for threadId ${options.threadId}`);
        }
        const { responseMessage, record } = await this.drpcMessageService.createResponseMessage(this.agentContext, options.response, drpcMessageRecord);
        await this.sendMessage(connection, responseMessage, record);
    }
    async sendMessage(connection, message, messageRecord) {
        const outboundMessageContext = new core_1.OutboundMessageContext(message, {
            agentContext: this.agentContext,
            connection,
            associatedRecord: messageRecord,
        });
        await this.messageSender.sendMessage(outboundMessageContext);
    }
    registerMessageHandlers(messageHandlerRegistry) {
        messageHandlerRegistry.registerMessageHandler(new handlers_1.DrpcRequestHandler(this.drpcMessageService));
        messageHandlerRegistry.registerMessageHandler(new handlers_1.DrpcResponseHandler(this.drpcMessageService));
    }
};
exports.DrpcApi = DrpcApi;
exports.DrpcApi = DrpcApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.MessageHandlerRegistry,
        services_1.DrpcService,
        core_1.MessageSender,
        core_1.ConnectionService,
        core_1.AgentContext])
], DrpcApi);
//# sourceMappingURL=DrpcApi.js.map