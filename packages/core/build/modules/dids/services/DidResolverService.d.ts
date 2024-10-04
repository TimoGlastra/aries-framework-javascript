import type { AgentContext } from '../../../agent';
import type { DidResolutionOptions, DidResolutionResult } from '../types';
import { Logger } from '../../../logger';
import { DidsModuleConfig } from '../DidsModuleConfig';
import { DidDocument } from '../domain';
import { DidRepository } from '../repository';
export declare class DidResolverService {
    private logger;
    private didsModuleConfig;
    private didRepository;
    constructor(logger: Logger, didsModuleConfig: DidsModuleConfig, didRepository: DidRepository);
    resolve(agentContext: AgentContext, didUrl: string, options?: DidResolutionOptions): Promise<DidResolutionResult>;
    /**
     * Resolve a did document. This uses the default resolution options, and thus
     * will use caching if available.
     */
    resolveDidDocument(agentContext: AgentContext, did: string): Promise<DidDocument>;
    invalidateCacheForDid(agentContext: AgentContext, did: string): Promise<void>;
    private getCacheKey;
    private findResolver;
    /**
     * Get all supported did methods for the did resolver.
     */
    get supportedMethods(): string[];
}
