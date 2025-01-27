import type { BaseAgent } from '@credo-ts/core';
/**
 * Migrates the {@link AnonCredsCredentialDefinitionRecord} to 0.4 compatible format. It fetches all credential definition records from
 * storage and updates the format based on the new ledger agnostic anoncreds models. After a record has been transformed,
 * it is updated in storage and the next record will be transformed.
 */
export declare function migrateAnonCredsCredentialDefinitionRecordToV0_4<Agent extends BaseAgent>(agent: Agent): Promise<void>;
export interface OldCredentialDefinition {
    id: string;
    schemaId: string;
    type: 'CL';
    tag: string;
    value: {
        primary: Record<string, unknown>;
        revocation?: unknown | undefined;
    };
    ver: string;
}
