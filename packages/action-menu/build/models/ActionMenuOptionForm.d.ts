import type { ActionMenuFormParameterOptions } from './ActionMenuOptionFormParameter';
import { ActionMenuFormParameter } from './ActionMenuOptionFormParameter';
/**
 * @public
 */
export interface ActionMenuFormOptions {
    description: string;
    params: ActionMenuFormParameterOptions[];
    submitLabel: string;
}
/**
 * @public
 */
export declare class ActionMenuForm {
    constructor(options: ActionMenuFormOptions);
    description: string;
    submitLabel: string;
    params: ActionMenuFormParameter[];
}
