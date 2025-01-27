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
exports.ActionMenuApi = void 0;
const core_1 = require("@credo-ts/core");
const ActionMenuRole_1 = require("./ActionMenuRole");
const handlers_1 = require("./handlers");
const services_1 = require("./services");
/**
 * @public
 */
let ActionMenuApi = class ActionMenuApi {
    constructor(connectionService, messageSender, actionMenuService, agentContext) {
        this.connectionService = connectionService;
        this.messageSender = messageSender;
        this.actionMenuService = actionMenuService;
        this.agentContext = agentContext;
        this.agentContext.dependencyManager.registerMessageHandlers([
            new handlers_1.ActionMenuProblemReportHandler(this.actionMenuService),
            new handlers_1.MenuMessageHandler(this.actionMenuService),
            new handlers_1.MenuRequestMessageHandler(this.actionMenuService),
            new handlers_1.PerformMessageHandler(this.actionMenuService),
        ]);
    }
    /**
     * Start Action Menu protocol as requester, asking for root menu. Any active menu will be cleared.
     *
     * @param options options for requesting menu
     * @returns Action Menu record associated to this new request
     */
    async requestMenu(options) {
        const connection = await this.connectionService.getById(this.agentContext, options.connectionId);
        const { message, record } = await this.actionMenuService.createRequest(this.agentContext, {
            connection,
        });
        const outboundMessageContext = await (0, core_1.getOutboundMessageContext)(this.agentContext, {
            message,
            associatedRecord: record,
            connectionRecord: connection,
        });
        await this.messageSender.sendMessage(outboundMessageContext);
        return record;
    }
    /**
     * Send a new Action Menu as responder. This menu will be sent as response if there is an
     * existing menu thread.
     *
     * @param options options for sending menu
     * @returns Action Menu record associated to this action
     */
    async sendMenu(options) {
        const connection = await this.connectionService.getById(this.agentContext, options.connectionId);
        const { message, record } = await this.actionMenuService.createMenu(this.agentContext, {
            connection,
            menu: options.menu,
        });
        const outboundMessageContext = await (0, core_1.getOutboundMessageContext)(this.agentContext, {
            message,
            associatedRecord: record,
            connectionRecord: connection,
        });
        await this.messageSender.sendMessage(outboundMessageContext);
        return record;
    }
    /**
     * Perform action in active Action Menu, as a requester. The related
     * menu will be closed.
     *
     * @param options options for requesting menu
     * @returns Action Menu record associated to this selection
     */
    async performAction(options) {
        const connection = await this.connectionService.getById(this.agentContext, options.connectionId);
        const actionMenuRecord = await this.actionMenuService.find(this.agentContext, {
            connectionId: connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Requester,
        });
        if (!actionMenuRecord) {
            throw new core_1.CredoError(`No active menu found for connection id ${options.connectionId}`);
        }
        const { message, record } = await this.actionMenuService.createPerform(this.agentContext, {
            actionMenuRecord,
            performedAction: options.performedAction,
        });
        const outboundMessageContext = await (0, core_1.getOutboundMessageContext)(this.agentContext, {
            message,
            associatedRecord: record,
            connectionRecord: connection,
        });
        await this.messageSender.sendMessage(outboundMessageContext);
        return record;
    }
    /**
     * Find the current active menu for a given connection and the specified role.
     *
     * @param options options for requesting active menu
     * @returns Active Action Menu record, or null if no active menu found
     */
    async findActiveMenu(options) {
        return this.actionMenuService.find(this.agentContext, {
            connectionId: options.connectionId,
            role: options.role,
        });
    }
    /**
     * Clears the current active menu for a given connection and the specified role.
     *
     * @param options options for clearing active menu
     * @returns Active Action Menu record, or null if no active menu record found
     */
    async clearActiveMenu(options) {
        const actionMenuRecord = await this.actionMenuService.find(this.agentContext, {
            connectionId: options.connectionId,
            role: options.role,
        });
        return actionMenuRecord ? await this.actionMenuService.clearMenu(this.agentContext, { actionMenuRecord }) : null;
    }
};
exports.ActionMenuApi = ActionMenuApi;
exports.ActionMenuApi = ActionMenuApi = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [core_1.ConnectionService,
        core_1.MessageSender,
        services_1.ActionMenuService,
        core_1.AgentContext])
], ActionMenuApi);
//# sourceMappingURL=ActionMenuApi.js.map