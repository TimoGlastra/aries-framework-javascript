import type { AgentContext } from '../../../../agent';
import type { DidResolver } from '../../domain/DidResolver';
import type { DidResolutionResult } from '../../types';
export declare class KeyDidResolver implements DidResolver {
    readonly supportedMethods: string[];
    /**
     * No remote resolving done, did document is dynamically constructed. To not pollute the cache we don't allow caching
     */
    readonly allowsCaching = false;
    /**
     * Easier to calculate for resolving than serving the local did document. Record also doesn't
     * have a did document
     */
    readonly allowsLocalDidRecord = false;
    resolve(agentContext: AgentContext, did: string): Promise<DidResolutionResult>;
}
