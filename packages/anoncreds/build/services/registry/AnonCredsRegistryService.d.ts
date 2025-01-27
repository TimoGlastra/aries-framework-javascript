import type { AnonCredsRegistry } from '.';
import type { AgentContext } from '@credo-ts/core';
/**
 * @internal
 * The AnonCreds registry service manages multiple {@link AnonCredsRegistry} instances
 * and returns the correct registry based on a given identifier
 */
export declare class AnonCredsRegistryService {
    getRegistryForIdentifier(agentContext: AgentContext, identifier: string): AnonCredsRegistry;
}
