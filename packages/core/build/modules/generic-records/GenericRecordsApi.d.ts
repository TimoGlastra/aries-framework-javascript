import type { GenericRecord, SaveGenericRecordOption } from './repository/GenericRecord';
import type { Query, QueryOptions } from '../../storage/StorageService';
import { AgentContext } from '../../agent';
import { Logger } from '../../logger';
import { GenericRecordService } from './services/GenericRecordService';
export type ContentType = {
    content: string;
};
export declare class GenericRecordsApi {
    private genericRecordsService;
    private logger;
    private agentContext;
    constructor(genericRecordsService: GenericRecordService, logger: Logger, agentContext: AgentContext);
    save({ content, tags, id }: SaveGenericRecordOption): Promise<GenericRecord>;
    delete(record: GenericRecord): Promise<void>;
    deleteById(id: string): Promise<void>;
    update(record: GenericRecord): Promise<void>;
    findById(id: string): Promise<GenericRecord | null>;
    findAllByQuery(query: Query<GenericRecord>, queryOptions?: QueryOptions): Promise<GenericRecord[]>;
    getAll(): Promise<GenericRecord[]>;
}
