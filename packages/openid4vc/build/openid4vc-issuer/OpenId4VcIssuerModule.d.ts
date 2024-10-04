import type { OpenId4VcIssuerModuleConfigOptions } from './OpenId4VcIssuerModuleConfig';
import type { AgentContext, DependencyManager, Module } from '@credo-ts/core';
import { OpenId4VcIssuerApi } from './OpenId4VcIssuerApi';
import { OpenId4VcIssuerModuleConfig } from './OpenId4VcIssuerModuleConfig';
/**
 * @public
 */
export declare class OpenId4VcIssuerModule implements Module {
    readonly api: typeof OpenId4VcIssuerApi;
    readonly config: OpenId4VcIssuerModuleConfig;
    constructor(options: OpenId4VcIssuerModuleConfigOptions);
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
