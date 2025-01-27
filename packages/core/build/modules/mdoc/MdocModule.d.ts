import type { Module, DependencyManager } from '../../plugins';
import { MdocApi } from './MdocApi';
/**
 * @public
 */
export declare class MdocModule implements Module {
    readonly api: typeof MdocApi;
    /**
     * Registers the dependencies of the mdoc module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
}
