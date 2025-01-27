import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { OpenId4VcIssuanceSessionRecord } from './OpenId4VcIssuanceSessionRecord';
export declare class OpenId4VcIssuanceSessionRepository extends Repository<OpenId4VcIssuanceSessionRecord> {
    constructor(storageService: StorageService<OpenId4VcIssuanceSessionRecord>, eventEmitter: EventEmitter);
}
