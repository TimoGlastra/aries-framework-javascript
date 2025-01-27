import type { TailsFileService } from './TailsFileService';
import type { AnonCredsRevocationRegistryDefinition } from '../../models';
import type { AgentContext } from '@credo-ts/core';
export declare class BasicTailsFileService implements TailsFileService {
    private tailsDirectoryPath?;
    constructor(options?: {
        tailsDirectoryPath?: string;
        tailsServerBaseUrl?: string;
    });
    getTailsBasePath(agentContext: AgentContext): Promise<string>;
    uploadTailsFile(agentContext: AgentContext, options: {
        revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    }): Promise<{
        tailsFileUrl: string;
    }>;
    getTailsFile(agentContext: AgentContext, options: {
        revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    }): Promise<{
        tailsFilePath: string;
    }>;
    protected getTailsFilePath(agentContext: AgentContext, tailsHash: string): Promise<string>;
    protected tailsFileExists(agentContext: AgentContext, tailsHash: string): Promise<boolean>;
}
