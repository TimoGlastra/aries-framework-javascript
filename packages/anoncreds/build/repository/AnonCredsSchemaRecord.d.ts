import type { AnonCredsSchemaRecordMetadata } from './anonCredsSchemaRecordMetadataTypes';
import type { AnonCredsSchema } from '../models';
import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsSchemaRecordProps {
    id?: string;
    schemaId: string;
    schema: AnonCredsSchema;
    methodName: string;
    createdAt?: Date;
}
export type DefaultAnonCredsSchemaTags = {
    schemaId: string;
    issuerId: string;
    schemaName: string;
    schemaVersion: string;
    methodName: string;
    unqualifiedSchemaId?: string;
};
export declare class AnonCredsSchemaRecord extends BaseRecord<DefaultAnonCredsSchemaTags, TagsBase, AnonCredsSchemaRecordMetadata> {
    static readonly type = "AnonCredsSchemaRecord";
    readonly type = "AnonCredsSchemaRecord";
    schemaId: string;
    schema: AnonCredsSchema;
    /**
     * AnonCreds method name. We don't use names explicitly from the registry (there's no identifier for a registry)
     * @see https://hyperledger.github.io/anoncreds-methods-registry/
     */
    methodName: string;
    constructor(props: AnonCredsSchemaRecordProps);
    getTags(): {
        schemaId: string;
        issuerId: string;
        schemaName: string;
        schemaVersion: string;
        methodName: string;
        unqualifiedSchemaId: string | undefined;
    };
}
