import type { ActionMenuRole } from '../ActionMenuRole';
import type { ActionMenuState } from '../ActionMenuState';
import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
import { ActionMenuSelection, ActionMenu } from '../models';
/**
 * @public
 */
export interface ActionMenuRecordProps {
    id?: string;
    state: ActionMenuState;
    role: ActionMenuRole;
    createdAt?: Date;
    connectionId: string;
    threadId: string;
    menu?: ActionMenu;
    performedAction?: ActionMenuSelection;
    tags?: CustomActionMenuTags;
}
/**
 * @public
 */
export type CustomActionMenuTags = TagsBase;
/**
 * @public
 */
export type DefaultActionMenuTags = {
    role: ActionMenuRole;
    connectionId: string;
    threadId: string;
};
/**
 * @public
 */
export declare class ActionMenuRecord extends BaseRecord<DefaultActionMenuTags, CustomActionMenuTags> implements ActionMenuRecordProps {
    state: ActionMenuState;
    role: ActionMenuRole;
    connectionId: string;
    threadId: string;
    menu?: ActionMenu;
    performedAction?: ActionMenuSelection;
    static readonly type = "ActionMenuRecord";
    readonly type = "ActionMenuRecord";
    constructor(props: ActionMenuRecordProps);
    getTags(): {
        role: ActionMenuRole;
        connectionId: string;
        threadId: string;
    };
    assertState(expectedStates: ActionMenuState | ActionMenuState[]): void;
    assertRole(expectedRole: ActionMenuRole): void;
}
