import type { Extensible } from '../services/registry/base';
export declare enum AnonCredsSchemaRecordMetadataKeys {
    SchemaRegistrationMetadata = "_internal/anonCredsSchemaRegistrationMetadata",
    SchemaMetadata = "_internal/anonCredsSchemaMetadata"
}
export type AnonCredsSchemaRecordMetadata = {
    [AnonCredsSchemaRecordMetadataKeys.SchemaRegistrationMetadata]: Extensible;
    [AnonCredsSchemaRecordMetadataKeys.SchemaMetadata]: Extensible;
};
