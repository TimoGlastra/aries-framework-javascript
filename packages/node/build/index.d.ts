import type { AgentDependencies } from '@credo-ts/core';
import { HttpInboundTransport } from './transport/HttpInboundTransport';
import { WsInboundTransport } from './transport/WsInboundTransport';
declare const agentDependencies: AgentDependencies;
export { agentDependencies, HttpInboundTransport, WsInboundTransport };
