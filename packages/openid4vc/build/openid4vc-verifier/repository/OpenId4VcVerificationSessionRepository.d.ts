import { Repository, StorageService, EventEmitter } from '@credo-ts/core';
import { OpenId4VcVerificationSessionRecord } from './OpenId4VcVerificationSessionRecord';
export declare class OpenId4VcVerificationSessionRepository extends Repository<OpenId4VcVerificationSessionRecord> {
    constructor(storageService: StorageService<OpenId4VcVerificationSessionRecord>, eventEmitter: EventEmitter);
}
