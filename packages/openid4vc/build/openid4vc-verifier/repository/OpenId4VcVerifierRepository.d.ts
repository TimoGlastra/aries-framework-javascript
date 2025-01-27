import type { AgentContext } from '@credo-ts/core';
import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { OpenId4VcVerifierRecord } from './OpenId4VcVerifierRecord';
export declare class OpenId4VcVerifierRepository extends Repository<OpenId4VcVerifierRecord> {
    constructor(storageService: StorageService<OpenId4VcVerifierRecord>, eventEmitter: EventEmitter);
    findByVerifierId(agentContext: AgentContext, verifierId: string): Promise<OpenId4VcVerifierRecord | null>;
    getByVerifierId(agentContext: AgentContext, verifierId: string): Promise<OpenId4VcVerifierRecord>;
}
