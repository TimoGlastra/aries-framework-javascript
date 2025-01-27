import type { DependencyManager, Module } from '@credo-ts/core';
export declare class BbsModule implements Module {
    /**
     * Registers the dependencies of the bbs module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
}
