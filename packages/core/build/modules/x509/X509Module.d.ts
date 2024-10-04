import type { X509ModuleConfigOptions } from './X509ModuleConfig';
import type { Module, DependencyManager } from '../../plugins';
import { X509Api } from './X509Api';
import { X509ModuleConfig } from './X509ModuleConfig';
/**
 * @public
 */
export declare class X509Module implements Module {
    readonly api: typeof X509Api;
    readonly config: X509ModuleConfig;
    constructor(options?: X509ModuleConfigOptions);
    /**
     * Registers the dependencies of the sd-jwt-vc module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
}
