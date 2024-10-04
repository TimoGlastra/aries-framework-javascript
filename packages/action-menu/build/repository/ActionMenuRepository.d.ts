import { EventEmitter, Repository, StorageService } from '@credo-ts/core';
import { ActionMenuRecord } from './ActionMenuRecord';
/**
 * @internal
 */
export declare class ActionMenuRepository extends Repository<ActionMenuRecord> {
    constructor(storageService: StorageService<ActionMenuRecord>, eventEmitter: EventEmitter);
}
