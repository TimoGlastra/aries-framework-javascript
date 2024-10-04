import type { BaseAgent } from '@credo-ts/core';
/**
 * Migrates the {@link AnonCredsSchemaRecord} to 0.4 compatible format. It fetches all schema records from
 * storage and updates the format based on the new ledger agnostic anoncreds models. After a record has been transformed,
 * it is updated in storage and the next record will be transformed.
 */
export declare function migrateAnonCredsSchemaRecordToV0_4<Agent extends BaseAgent>(agent: Agent): Promise<void>;
export interface OldSchema {
    id: string;
    name: string;
    version: string;
    attrNames: string[];
    seqNo: number;
    ver: string;
}
