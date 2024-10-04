import type { ActionMenuOptionOptions } from './ActionMenuOption';
import { ActionMenuOption } from './ActionMenuOption';
/**
 * @public
 */
export interface ActionMenuOptions {
    title: string;
    description: string;
    options: ActionMenuOptionOptions[];
}
/**
 * @public
 */
export declare class ActionMenu {
    constructor(options: ActionMenuOptions);
    title: string;
    description: string;
    options: ActionMenuOption[];
}
