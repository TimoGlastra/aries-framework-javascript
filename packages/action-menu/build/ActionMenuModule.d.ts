import type { DependencyManager, FeatureRegistry, Module } from '@credo-ts/core';
import { ActionMenuApi } from './ActionMenuApi';
/**
 * @public
 */
export declare class ActionMenuModule implements Module {
    readonly api: typeof ActionMenuApi;
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void;
}
