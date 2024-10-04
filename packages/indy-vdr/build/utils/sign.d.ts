import type { IndyVdrPool } from '../pool';
import type { AgentContext, Key } from '@credo-ts/core';
import type { IndyVdrRequest } from '@hyperledger/indy-vdr-shared';
export declare function multiSignRequest<Request extends IndyVdrRequest>(agentContext: AgentContext, request: Request, signingKey: Key, identifier: string): Promise<Request>;
export declare function signRequest<Request extends IndyVdrRequest>(agentContext: AgentContext, pool: IndyVdrPool, request: Request, submitterDid: string): Promise<Request>;
