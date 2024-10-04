import type { AgentContext } from '@credo-ts/core';
import { AnonCredsLinkSecretRecord } from '../repository';
export declare function storeLinkSecret(agentContext: AgentContext, options: {
    linkSecretId: string;
    linkSecretValue?: string;
    setAsDefault?: boolean;
}): Promise<AnonCredsLinkSecretRecord>;
export declare function assertLinkSecretsMatch(agentContext: AgentContext, linkSecretIds: string[]): string;
export declare function getLinkSecret(agentContext: AgentContext, linkSecretId: string): Promise<string>;
