import type { OpenId4VciTxCode } from '../../shared';
import type { AgentContext } from '@credo-ts/core';
export declare function generateTxCode(agentContext: AgentContext, txCode: OpenId4VciTxCode): string;
