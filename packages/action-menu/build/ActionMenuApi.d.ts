import type { ClearActiveMenuOptions, FindActiveMenuOptions, PerformActionOptions, RequestMenuOptions, SendMenuOptions } from './ActionMenuApiOptions';
import { AgentContext, ConnectionService, MessageSender } from '@credo-ts/core';
import { ActionMenuService } from './services';
/**
 * @public
 */
export declare class ActionMenuApi {
    private connectionService;
    private messageSender;
    private actionMenuService;
    private agentContext;
    constructor(connectionService: ConnectionService, messageSender: MessageSender, actionMenuService: ActionMenuService, agentContext: AgentContext);
    /**
     * Start Action Menu protocol as requester, asking for root menu. Any active menu will be cleared.
     *
     * @param options options for requesting menu
     * @returns Action Menu record associated to this new request
     */
    requestMenu(options: RequestMenuOptions): Promise<import("./repository").ActionMenuRecord>;
    /**
     * Send a new Action Menu as responder. This menu will be sent as response if there is an
     * existing menu thread.
     *
     * @param options options for sending menu
     * @returns Action Menu record associated to this action
     */
    sendMenu(options: SendMenuOptions): Promise<import("./repository").ActionMenuRecord>;
    /**
     * Perform action in active Action Menu, as a requester. The related
     * menu will be closed.
     *
     * @param options options for requesting menu
     * @returns Action Menu record associated to this selection
     */
    performAction(options: PerformActionOptions): Promise<import("./repository").ActionMenuRecord>;
    /**
     * Find the current active menu for a given connection and the specified role.
     *
     * @param options options for requesting active menu
     * @returns Active Action Menu record, or null if no active menu found
     */
    findActiveMenu(options: FindActiveMenuOptions): Promise<import("./repository").ActionMenuRecord | null>;
    /**
     * Clears the current active menu for a given connection and the specified role.
     *
     * @param options options for clearing active menu
     * @returns Active Action Menu record, or null if no active menu record found
     */
    clearActiveMenu(options: ClearActiveMenuOptions): Promise<import("./repository").ActionMenuRecord | null>;
}
