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
exports.ActionMenuService = void 0;
const core_1 = require("@credo-ts/core");
const ActionMenuEvents_1 = require("../ActionMenuEvents");
const ActionMenuRole_1 = require("../ActionMenuRole");
const ActionMenuState_1 = require("../ActionMenuState");
const ActionMenuProblemReportError_1 = require("../errors/ActionMenuProblemReportError");
const ActionMenuProblemReportReason_1 = require("../errors/ActionMenuProblemReportReason");
const messages_1 = require("../messages");
const models_1 = require("../models");
const repository_1 = require("../repository");
/**
 * @internal
 */
let ActionMenuService = class ActionMenuService {
    constructor(actionMenuRepository, agentConfig, eventEmitter) {
        this.actionMenuRepository = actionMenuRepository;
        this.eventEmitter = eventEmitter;
        this.logger = agentConfig.logger;
    }
    async createRequest(agentContext, options) {
        // Assert
        options.connection.assertReady();
        // Create message
        const menuRequestMessage = new messages_1.MenuRequestMessage({});
        // Create record if not existent for connection/role
        let actionMenuRecord = await this.find(agentContext, {
            connectionId: options.connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Requester,
        });
        if (actionMenuRecord) {
            // Protocol will be restarted and menu cleared
            const previousState = actionMenuRecord.state;
            actionMenuRecord.state = ActionMenuState_1.ActionMenuState.AwaitingRootMenu;
            actionMenuRecord.threadId = menuRequestMessage.id;
            actionMenuRecord.menu = undefined;
            actionMenuRecord.performedAction = undefined;
            await this.actionMenuRepository.update(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
        }
        else {
            actionMenuRecord = new repository_1.ActionMenuRecord({
                connectionId: options.connection.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.AwaitingRootMenu,
                threadId: menuRequestMessage.threadId,
            });
            await this.actionMenuRepository.save(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
        }
        return { message: menuRequestMessage, record: actionMenuRecord };
    }
    async processRequest(messageContext) {
        const { message: menuRequestMessage, agentContext } = messageContext;
        this.logger.debug(`Processing menu request with id ${menuRequestMessage.id}`);
        // Assert
        const connection = messageContext.assertReadyConnection();
        let actionMenuRecord = await this.find(agentContext, {
            connectionId: connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Responder,
        });
        if (actionMenuRecord) {
            // Protocol will be restarted and menu cleared
            const previousState = actionMenuRecord.state;
            actionMenuRecord.state = ActionMenuState_1.ActionMenuState.PreparingRootMenu;
            actionMenuRecord.threadId = menuRequestMessage.id;
            actionMenuRecord.menu = undefined;
            actionMenuRecord.performedAction = undefined;
            await this.actionMenuRepository.update(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
        }
        else {
            // Create record
            actionMenuRecord = new repository_1.ActionMenuRecord({
                connectionId: connection.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.PreparingRootMenu,
                threadId: menuRequestMessage.threadId,
            });
            await this.actionMenuRepository.save(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
        }
        return actionMenuRecord;
    }
    async createMenu(agentContext, options) {
        // Assert connection ready
        options.connection.assertReady();
        const uniqueNames = new Set(options.menu.options.map((v) => v.name));
        if (uniqueNames.size < options.menu.options.length) {
            throw new core_1.CredoError('Action Menu contains duplicated options');
        }
        // Create message
        const menuMessage = new messages_1.MenuMessage({
            title: options.menu.title,
            description: options.menu.description,
            options: options.menu.options,
        });
        // Check if there is an existing menu for this connection and role
        let actionMenuRecord = await this.find(agentContext, {
            connectionId: options.connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Responder,
        });
        // If so, continue existing flow
        if (actionMenuRecord) {
            actionMenuRecord.assertState([ActionMenuState_1.ActionMenuState.Null, ActionMenuState_1.ActionMenuState.PreparingRootMenu, ActionMenuState_1.ActionMenuState.Done]);
            // The new menu will be bound to the existing thread
            // unless it is in null state (protocol reset)
            if (actionMenuRecord.state !== ActionMenuState_1.ActionMenuState.Null) {
                menuMessage.setThread({ threadId: actionMenuRecord.threadId });
            }
            const previousState = actionMenuRecord.state;
            actionMenuRecord.menu = options.menu;
            actionMenuRecord.state = ActionMenuState_1.ActionMenuState.AwaitingSelection;
            actionMenuRecord.threadId = menuMessage.threadId;
            await this.actionMenuRepository.update(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, previousState);
        }
        else {
            // Create record
            actionMenuRecord = new repository_1.ActionMenuRecord({
                connectionId: options.connection.id,
                role: ActionMenuRole_1.ActionMenuRole.Responder,
                state: ActionMenuState_1.ActionMenuState.AwaitingSelection,
                menu: options.menu,
                threadId: menuMessage.threadId,
            });
            await this.actionMenuRepository.save(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
        }
        return { message: menuMessage, record: actionMenuRecord };
    }
    async processMenu(messageContext) {
        const { message: menuMessage, agentContext } = messageContext;
        this.logger.debug(`Processing action menu with id ${menuMessage.id}`);
        // Assert
        const connection = messageContext.assertReadyConnection();
        // Check if there is an existing menu for this connection and role
        const record = await this.find(agentContext, {
            connectionId: connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Requester,
        });
        if (record) {
            // Record found: update with menu details
            const previousState = record.state;
            record.state = ActionMenuState_1.ActionMenuState.PreparingSelection;
            record.menu = new models_1.ActionMenu({
                title: menuMessage.title,
                description: menuMessage.description,
                options: menuMessage.options,
            });
            record.threadId = menuMessage.threadId;
            record.performedAction = undefined;
            await this.actionMenuRepository.update(agentContext, record);
            this.emitStateChangedEvent(agentContext, record, previousState);
        }
        else {
            // Record not found: create it
            const actionMenuRecord = new repository_1.ActionMenuRecord({
                connectionId: connection.id,
                role: ActionMenuRole_1.ActionMenuRole.Requester,
                state: ActionMenuState_1.ActionMenuState.PreparingSelection,
                threadId: menuMessage.threadId,
                menu: new models_1.ActionMenu({
                    title: menuMessage.title,
                    description: menuMessage.description,
                    options: menuMessage.options,
                }),
            });
            await this.actionMenuRepository.save(agentContext, actionMenuRecord);
            this.emitStateChangedEvent(agentContext, actionMenuRecord, null);
        }
    }
    async createPerform(agentContext, options) {
        var _a;
        const { actionMenuRecord: record, performedAction: performedSelection } = options;
        // Assert
        record.assertRole(ActionMenuRole_1.ActionMenuRole.Requester);
        record.assertState([ActionMenuState_1.ActionMenuState.PreparingSelection]);
        const validSelection = (_a = record.menu) === null || _a === void 0 ? void 0 : _a.options.some((item) => item.name === performedSelection.name);
        if (!validSelection) {
            throw new core_1.CredoError('Selection does not match valid actions');
        }
        const previousState = record.state;
        // Create message
        const menuMessage = new messages_1.PerformMessage({
            name: performedSelection.name,
            params: performedSelection.params,
            threadId: record.threadId,
        });
        // Update record
        record.performedAction = options.performedAction;
        record.state = ActionMenuState_1.ActionMenuState.Done;
        await this.actionMenuRepository.update(agentContext, record);
        this.emitStateChangedEvent(agentContext, record, previousState);
        return { message: menuMessage, record };
    }
    async processPerform(messageContext) {
        var _a;
        const { message: performMessage, agentContext } = messageContext;
        this.logger.debug(`Processing action menu perform with id ${performMessage.id}`);
        const connection = messageContext.assertReadyConnection();
        // Check if there is an existing menu for this connection and role
        const record = await this.find(agentContext, {
            connectionId: connection.id,
            role: ActionMenuRole_1.ActionMenuRole.Responder,
            threadId: performMessage.threadId,
        });
        if (record) {
            // Record found: check state and update with menu details
            // A Null state means that menu has been cleared by the responder.
            // Requester should be informed in order to request another menu
            if (record.state === ActionMenuState_1.ActionMenuState.Null) {
                throw new ActionMenuProblemReportError_1.ActionMenuProblemReportError('Action Menu has been cleared by the responder', {
                    problemCode: ActionMenuProblemReportReason_1.ActionMenuProblemReportReason.Timeout,
                });
            }
            record.assertState([ActionMenuState_1.ActionMenuState.AwaitingSelection]);
            const validSelection = (_a = record.menu) === null || _a === void 0 ? void 0 : _a.options.some((item) => item.name === performMessage.name);
            if (!validSelection) {
                throw new core_1.CredoError('Selection does not match valid actions');
            }
            const previousState = record.state;
            record.state = ActionMenuState_1.ActionMenuState.Done;
            record.performedAction = new models_1.ActionMenuSelection({ name: performMessage.name, params: performMessage.params });
            await this.actionMenuRepository.update(agentContext, record);
            this.emitStateChangedEvent(agentContext, record, previousState);
        }
        else {
            throw new core_1.CredoError(`No Action Menu found with thread id ${messageContext.message.threadId}`);
        }
    }
    async clearMenu(agentContext, options) {
        const { actionMenuRecord: record } = options;
        const previousState = record.state;
        // Update record
        record.state = ActionMenuState_1.ActionMenuState.Null;
        record.menu = undefined;
        record.performedAction = undefined;
        await this.actionMenuRepository.update(agentContext, record);
        this.emitStateChangedEvent(agentContext, record, previousState);
        return record;
    }
    async processProblemReport(messageContext) {
        const { message: actionMenuProblemReportMessage, agentContext } = messageContext;
        const connection = messageContext.assertReadyConnection();
        this.logger.debug(`Processing problem report with id ${actionMenuProblemReportMessage.id}`);
        const actionMenuRecord = await this.find(agentContext, {
            role: ActionMenuRole_1.ActionMenuRole.Requester,
            connectionId: connection.id,
        });
        if (!actionMenuRecord) {
            throw new core_1.CredoError(`Unable to process action menu problem: record not found for connection id ${connection.id}`);
        }
        // Clear menu to restart flow
        return await this.clearMenu(agentContext, { actionMenuRecord });
    }
    async findById(agentContext, actionMenuRecordId) {
        return await this.actionMenuRepository.findById(agentContext, actionMenuRecordId);
    }
    async find(agentContext, options) {
        return await this.actionMenuRepository.findSingleByQuery(agentContext, {
            connectionId: options.connectionId,
            role: options.role,
            threadId: options.threadId,
        });
    }
    async findAllByQuery(agentContext, options, queryOptions) {
        return await this.actionMenuRepository.findByQuery(agentContext, options, queryOptions);
    }
    emitStateChangedEvent(agentContext, actionMenuRecord, previousState) {
        this.eventEmitter.emit(agentContext, {
            type: ActionMenuEvents_1.ActionMenuEventTypes.ActionMenuStateChanged,
            payload: {
                actionMenuRecord: actionMenuRecord.clone(),
                previousState: previousState,
            },
        });
    }
};
exports.ActionMenuService = ActionMenuService;
exports.ActionMenuService = ActionMenuService = __decorate([
    (0, core_1.injectable)(),
    __metadata("design:paramtypes", [repository_1.ActionMenuRepository, core_1.AgentConfig, core_1.EventEmitter])
], ActionMenuService);
//# sourceMappingURL=ActionMenuService.js.map