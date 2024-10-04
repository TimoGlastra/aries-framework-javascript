/**
 * @public
 */
export declare enum ActionMenuFormInputType {
    Text = "text"
}
/**
 * @public
 */
export interface ActionMenuFormParameterOptions {
    name: string;
    title: string;
    default?: string;
    description: string;
    required?: boolean;
    type?: ActionMenuFormInputType;
}
/**
 * @public
 */
export declare class ActionMenuFormParameter {
    constructor(options: ActionMenuFormParameterOptions);
    name: string;
    title: string;
    default?: string;
    description: string;
    required?: boolean;
    type?: ActionMenuFormInputType;
}
