/**
 * @public
 */
export interface ActionMenuSelectionOptions {
    name: string;
    params?: Record<string, string>;
}
/**
 * @public
 */
export declare class ActionMenuSelection {
    constructor(options: ActionMenuSelectionOptions);
    name: string;
    params?: Record<string, string>;
}
