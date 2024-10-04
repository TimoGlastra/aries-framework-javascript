import type { BaseRecord, BaseRecordConstructor, Query, TagsBase } from '@credo-ts/core';
import type { EntryObject } from '@hyperledger/aries-askar-shared';
export declare function recordToInstance<T extends BaseRecord>(record: EntryObject, recordClass: BaseRecordConstructor<T>): T;
export declare function transformToRecordTagValues(tags: Record<string, unknown>): TagsBase;
export declare function transformFromRecordTagValues(tags: TagsBase): {
    [key: string]: string | undefined;
};
/**
 * Transforms the search query into a wallet query compatible with Askar WQL.
 *
 * The format used by Credo is almost the same as the WQL query, with the exception of
 * the encoding of values, however this is handled by the {@link AskarStorageServiceUtil.transformToRecordTagValues}
 * method.
 */
export declare function askarQueryFromSearchQuery<T extends BaseRecord>(query: Query<T>): Record<string, unknown>;
