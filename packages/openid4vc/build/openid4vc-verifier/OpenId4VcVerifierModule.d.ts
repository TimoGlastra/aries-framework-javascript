import type { OpenId4VcVerifierModuleConfigOptions } from './OpenId4VcVerifierModuleConfig';
import type { AgentContext, DependencyManager, Module } from '@credo-ts/core';
import { OpenId4VcVerifierApi } from './OpenId4VcVerifierApi';
import { OpenId4VcVerifierModuleConfig } from './OpenId4VcVerifierModuleConfig';
/**
 * @public
 */
export declare class OpenId4VcVerifierModule implements Module {
    readonly api: typeof OpenId4VcVerifierApi;
    readonly config: OpenId4VcVerifierModuleConfig;
    constructor(options: OpenId4VcVerifierModuleConfigOptions);
    /**
     * Registers the dependencies of the question answer module on the dependency manager.
     */
    register(dependencyManager: DependencyManager): void;
    initialize(rootAgentContext: AgentContext): Promise<void>;
    /**
     * Registers the endpoints on the router passed to this module.
     */
    private configureRouter;
}
