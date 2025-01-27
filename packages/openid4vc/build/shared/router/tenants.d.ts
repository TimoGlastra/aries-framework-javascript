import type { AgentContext } from '@credo-ts/core';
export declare function getAgentContextForActorId(rootAgentContext: AgentContext, actorId: string): Promise<AgentContext>;
/**
 * Store the actor id associated with a context correlation id. If multi-tenancy is not used
 * this method won't do anything as we can just use the actor from the default context. However
 * if multi-tenancy is used, we will store the actor id in the tenant record metadata so it can
 * be queried when a request comes in for the specific actor id.
 *
 * The reason for doing this is that we don't want to expose the context correlation id in the
 * actor metadata url, as it is then possible to see exactly which actors are registered under
 * the same agent.
 */
export declare function storeActorIdForContextCorrelationId(agentContext: AgentContext, actorId: string): Promise<void>;
