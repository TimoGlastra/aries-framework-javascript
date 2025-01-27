import type { ActionMenuFormOptions } from './ActionMenuOptionForm';
import { ActionMenuForm } from './ActionMenuOptionForm';
/**
 * @public
 */
export interface ActionMenuOptionOptions {
    name: string;
    title: string;
    description: string;
    disabled?: boolean;
    form?: ActionMenuFormOptions;
}
/**
 * @public
 */
export declare class ActionMenuOption {
    constructor(options: ActionMenuOptionOptions);
    name: string;
    title: string;
    description: string;
    disabled?: boolean;
    form?: ActionMenuForm;
}
