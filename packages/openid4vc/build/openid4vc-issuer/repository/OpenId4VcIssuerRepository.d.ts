import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { OpenId4VcIssuerRecord } from './OpenId4VcIssuerRecord';
export declare class OpenId4VcIssuerRepository extends Repository<OpenId4VcIssuerRecord> {
    constructor(storageService: StorageService<OpenId4VcIssuerRecord>, eventEmitter: EventEmitter);
    findByIssuerId(agentContext: AgentContext, issuerId: string): Promise<OpenId4VcIssuerRecord | null>;
    getByIssuerId(agentContext: AgentContext, issuerId: string): Promise<OpenId4VcIssuerRecord>;
}
