import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsCredentialDefinitionPrivateRecordProps {
    id?: string;
    credentialDefinitionId: string;
    value: Record<string, unknown>;
    createdAt?: Date;
}
export type DefaultAnonCredsCredentialDefinitionPrivateTags = {
    credentialDefinitionId: string;
};
export declare class AnonCredsCredentialDefinitionPrivateRecord extends BaseRecord<DefaultAnonCredsCredentialDefinitionPrivateTags, TagsBase> {
    static readonly type = "AnonCredsCredentialDefinitionPrivateRecord";
    readonly type = "AnonCredsCredentialDefinitionPrivateRecord";
    readonly credentialDefinitionId: string;
    readonly value: Record<string, unknown>;
    constructor(props: AnonCredsCredentialDefinitionPrivateRecordProps);
    getTags(): {
        credentialDefinitionId: string;
    };
}
