import { EventEmitter } from '../../../agent/EventEmitter';
import { Repository } from '../../../storage/Repository';
import { StorageService } from '../../../storage/StorageService';
import { MdocRecord } from './MdocRecord';
export declare class MdocRepository extends Repository<MdocRecord> {
    constructor(storageService: StorageService<MdocRecord>, eventEmitter: EventEmitter);
}
