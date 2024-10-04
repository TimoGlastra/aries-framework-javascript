import type { AnonCredsRevocationRegistryDefinitionRecordMetadata } from './anonCredsRevocationRegistryDefinitionRecordMetadataTypes';
import type { AnonCredsRevocationRegistryDefinition } from '../models';
import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsRevocationRegistryDefinitionRecordProps {
    id?: string;
    revocationRegistryDefinitionId: string;
    revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    createdAt?: Date;
}
export type DefaultAnonCredsRevocationRegistryDefinitionTags = {
    revocationRegistryDefinitionId: string;
    credentialDefinitionId: string;
};
export declare class AnonCredsRevocationRegistryDefinitionRecord extends BaseRecord<DefaultAnonCredsRevocationRegistryDefinitionTags, TagsBase, AnonCredsRevocationRegistryDefinitionRecordMetadata> {
    static readonly type = "AnonCredsRevocationRegistryDefinitionRecord";
    readonly type = "AnonCredsRevocationRegistryDefinitionRecord";
    readonly revocationRegistryDefinitionId: string;
    readonly revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    constructor(props: AnonCredsRevocationRegistryDefinitionRecordProps);
    getTags(): {
        revocationRegistryDefinitionId: string;
        credentialDefinitionId: string;
    };
}
