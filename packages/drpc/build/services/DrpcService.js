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
exports.DrpcService = void 0;
const core_1 = require("@credo-ts/core");
const DrpcRequestEvents_1 = require("../DrpcRequestEvents");
const DrpcResponseEvents_1 = require("../DrpcResponseEvents");
const messages_1 = require("../messages");
const models_1 = require("../models");
const repository_1 = require("../repository");
let DrpcService = class DrpcService {
    constructor(drpcMessageRepository, eventEmitter) {
        this.drpcMessageRepository = drpcMessageRepository;
        this.eventEmitter = eventEmitter;
    }
    async createRequestMessage(agentContext, request, connectionId) {
        const drpcMessage = new messages_1.DrpcRequestMessage({ request });
        const drpcMessageRecord = new repository_1.DrpcRecord({
            request,
            connectionId,
            state: models_1.DrpcState.RequestSent,
            threadId: drpcMessage.threadId,
            role: models_1.DrpcRole.Client,
        });
        await this.drpcMessageRepository.save(agentContext, drpcMessageRecord);
        this.emitStateChangedEvent(agentContext, drpcMessageRecord);
        return { requestMessage: drpcMessage, record: drpcMessageRecord };
    }
    async createResponseMessage(agentContext, response, drpcRecord) {
        const drpcMessage = new messages_1.DrpcResponseMessage({ response, threadId: drpcRecord.threadId });
        drpcRecord.assertState(models_1.DrpcState.RequestReceived);
        drpcRecord.response = response;
        drpcRecord.request = undefined;
        await this.updateState(agentContext, drpcRecord, models_1.DrpcState.Completed);
        return { responseMessage: drpcMessage, record: drpcRecord };
    }
    createRequestListener(callback) {
        const listener = async (event) => {
            const { drpcMessageRecord } = event.payload;
            await callback({
                drpcMessageRecord,
                removeListener: () => this.eventEmitter.off(DrpcRequestEvents_1.DrpcRequestEventTypes.DrpcRequestStateChanged, listener),
            });
        };
        this.eventEmitter.on(DrpcRequestEvents_1.DrpcRequestEventTypes.DrpcRequestStateChanged, listener);
        return () => {
            this.eventEmitter.off(DrpcRequestEvents_1.DrpcRequestEventTypes.DrpcRequestStateChanged, listener);
        };
    }
    createResponseListener(callback) {
        const listener = async (event) => {
            const { drpcMessageRecord } = event.payload;
            await callback({
                drpcMessageRecord,
                removeListener: () => this.eventEmitter.off(DrpcResponseEvents_1.DrpcResponseEventTypes.DrpcResponseStateChanged, listener),
            });
        };
        this.eventEmitter.on(DrpcResponseEvents_1.DrpcResponseEventTypes.DrpcResponseStateChanged, listener);
        return () => {
            this.eventEmitter.off(DrpcResponseEvents_1.DrpcResponseEventTypes.DrpcResponseStateChanged, listener);
        };
    }
    async receiveResponse(messageContext) {
        const connection = messageContext.assertReadyConnection();
        const drpcMessageRecord = await this.findByThreadAndConnectionId(messageContext.agentContext, connection.id, messageContext.message.threadId);
        if (!drpcMessageRecord) {
            throw new Error('DRPC message record not found');
        }
        drpcMessageRecord.assertRole(models_1.DrpcRole.Client);
        drpcMessageRecord.assertState(models_1.DrpcState.RequestSent);
        drpcMessageRecord.response = messageContext.message.response;
        drpcMessageRecord.request = undefined;
        await this.updateState(messageContext.agentContext, drpcMessageRecord, models_1.DrpcState.Completed);
        return drpcMessageRecord;
    }
    async receiveRequest(messageContext) {
        const connection = messageContext.assertReadyConnection();
        const record = await this.findByThreadAndConnectionId(messageContext.agentContext, connection.id, messageContext.message.threadId);
        if (record) {
            throw new Error('DRPC message record already exists');
        }
        const drpcMessageRecord = new repository_1.DrpcRecord({
            request: messageContext.message.request,
            connectionId: connection.id,
            role: models_1.DrpcRole.Server,
            state: models_1.DrpcState.RequestReceived,
            threadId: messageContext.message.id,
        });
        await this.drpcMessageRepository.save(messageContext.agentContext, drpcMessageRecord);
        this.emitStateChangedEvent(messageContext.agentContext, drpcMessageRecord);
        return drpcMessageRecord;
    }
    emitStateChangedEvent(agentContext, drpcMessageRecord) {
        if (drpcMessageRecord.request &&
            ((0, models_1.isValidDrpcRequest)(drpcMessageRecord.request) ||
                (Array.isArray(drpcMessageRecord.request) &&
                    drpcMessageRecord.request.length > 0 &&
                    (0, models_1.isValidDrpcRequest)(drpcMessageRecord.request[0])))) {
            this.eventEmitter.emit(agentContext, {
                type: DrpcRequestEvents_1.DrpcRequestEventTypes.DrpcRequestStateChanged,
                payload: { drpcMessageRecord: drpcMessageRecord.clone() },
            });
        }
        else if (drpcMessageRecord.response &&
            ((0, models_1.isValidDrpcResponse)(drpcMessageRecord.response) ||
                (Array.isArray(drpcMessageRecord.response) &&
                    drpcMessageRecord.response.length > 0 &&
                    (0, models_1.isValidDrpcResponse)(drpcMessageRecord.response[0])))) {
            this.eventEmitter.emit(agentContext, {
                type: DrpcResponseEvents_1.DrpcResponseEventTypes.DrpcResponseStateChanged,
                payload: { drpcMessageRecord: drpcMessageRecord.clone() },
            });
        }
    }
    async updateState(agentContext, drpcRecord, newState) {
        drpcRecord.state = newState;
        await this.drpcMessageRepository.update(agentContext, drpcRecord);
        this.emitStateChangedEvent(agentContext, drpcRecord);
    }
    findByThreadAndConnectionId(agentContext, connectionId, threadId) {
        return this.drpcMessageRepository.findSingleByQuery(agentContext, {
            connectionId,
            threadId,
        });
    }
    async findAllByQuery(agentContext, query, queryOptions) {
        return this.drpcMessageRepository.findByQuery(agentContext, query, queryOptions);
    }
    async getById(agentContext, drpcMessageRecordId) {
        return this.drpcMessageRepository.getById(agentContext, drpcMessageRecordId);
    }
    async deleteById(agentContext, drpcMessageRecordId) {
        const drpcMessageRecord = await this.getById(agentContext, drpcMessageRecordId);
        return this.drpcMessageRepository.delete(agentContext, drpcMessageRecord);
    }
};
exports.DrpcService = DrpcService;
exports.DrpcService = DrpcService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [repository_1.DrpcRepository, core_1.EventEmitter])
], DrpcService);
//# sourceMappingURL=DrpcService.js.map