import { EventEmitter, Repository, StorageService } from '@credo-ts/core';
import { DrpcRecord } from './DrpcRecord';
export declare class DrpcRepository extends Repository<DrpcRecord> {
    constructor(storageService: StorageService<DrpcRecord>, eventEmitter: EventEmitter);
}
