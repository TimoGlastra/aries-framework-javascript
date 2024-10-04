import type { DependencyManager, Module } from '@credo-ts/core';
import { OpenId4VcHolderApi } from './OpenId4VcHolderApi';
/**
 * @public @module OpenId4VcHolderModule
 * This module provides the functionality to assume the role of owner in relation to the OpenId4VC specification suite.
 */
export declare class OpenId4VcHolderModule implements Module {
    readonly api: typeof OpenId4VcHolderApi;
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
}
