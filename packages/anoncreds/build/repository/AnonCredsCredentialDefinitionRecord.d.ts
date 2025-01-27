import type { AnonCredsCredentialDefinitionRecordMetadata } from './anonCredsCredentialDefinitionRecordMetadataTypes';
import type { AnonCredsCredentialDefinition } from '../models';
import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsCredentialDefinitionRecordProps {
    id?: string;
    credentialDefinitionId: string;
    credentialDefinition: AnonCredsCredentialDefinition;
    methodName: string;
    createdAt?: Date;
}
export type DefaultAnonCredsCredentialDefinitionTags = {
    schemaId: string;
    credentialDefinitionId: string;
    issuerId: string;
    tag: string;
    methodName: string;
    unqualifiedCredentialDefinitionId?: string;
};
export declare class AnonCredsCredentialDefinitionRecord extends BaseRecord<DefaultAnonCredsCredentialDefinitionTags, TagsBase, AnonCredsCredentialDefinitionRecordMetadata> {
    static readonly type = "AnonCredsCredentialDefinitionRecord";
    readonly type = "AnonCredsCredentialDefinitionRecord";
    credentialDefinitionId: string;
    credentialDefinition: AnonCredsCredentialDefinition;
    /**
     * AnonCreds method name. We don't use names explicitly from the registry (there's no identifier for a registry)
     * @see https://hyperledger.github.io/anoncreds-methods-registry/
     */
    methodName: string;
    constructor(props: AnonCredsCredentialDefinitionRecordProps);
    getTags(): {
        credentialDefinitionId: string;
        schemaId: string;
        issuerId: string;
        tag: string;
        methodName: string;
        unqualifiedCredentialDefinitionId: string | undefined;
    };
}
