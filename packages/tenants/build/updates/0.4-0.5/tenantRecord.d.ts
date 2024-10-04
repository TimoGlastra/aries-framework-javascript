import type { BaseAgent } from '@credo-ts/core';
/**
 * Migrates the {@link TenantRecord} to 0.5 compatible format. It fetches all tenant records from
 * storage and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - Re-save record to store new `label` tag
 */
export declare function migrateTenantRecordToV0_5<Agent extends BaseAgent>(agent: Agent): Promise<void>;
