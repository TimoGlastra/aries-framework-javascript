import type { AgentDependencies } from '../agent/AgentDependencies';
export declare function fetchWithTimeout(fetch: AgentDependencies['fetch'], url: string, init?: Omit<RequestInit, 'signal'> & {
    /**
     * @default 5000
     */
    timeoutMs?: number;
}): Promise<Response>;
