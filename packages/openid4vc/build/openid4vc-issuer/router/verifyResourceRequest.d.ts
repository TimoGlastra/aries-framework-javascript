import type { OpenId4VcIssuanceRequest } from './requestContext';
import type { OpenId4VcIssuerRecord } from '../repository';
import type { AgentContext } from '@credo-ts/core';
export declare function verifyResourceRequest(agentContext: AgentContext, issuer: OpenId4VcIssuerRecord, request: OpenId4VcIssuanceRequest): Promise<{
    preAuthorizedCode: string;
}>;
