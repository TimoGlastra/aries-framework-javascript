import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export declare enum AnonCredsRevocationRegistryState {
    Created = "created",
    Active = "active",
    Full = "full"
}
export interface AnonCredsRevocationRegistryDefinitionPrivateRecordProps {
    id?: string;
    revocationRegistryDefinitionId: string;
    credentialDefinitionId: string;
    value: Record<string, unknown>;
    index?: number;
    state?: AnonCredsRevocationRegistryState;
}
export type DefaultAnonCredsRevocationRegistryPrivateTags = {
    revocationRegistryDefinitionId: string;
    credentialDefinitionId: string;
    state: AnonCredsRevocationRegistryState;
};
export declare class AnonCredsRevocationRegistryDefinitionPrivateRecord extends BaseRecord<DefaultAnonCredsRevocationRegistryPrivateTags, TagsBase> {
    static readonly type = "AnonCredsRevocationRegistryDefinitionPrivateRecord";
    readonly type = "AnonCredsRevocationRegistryDefinitionPrivateRecord";
    readonly revocationRegistryDefinitionId: string;
    readonly credentialDefinitionId: string;
    readonly value: Record<string, unknown>;
    state: AnonCredsRevocationRegistryState;
    constructor(props: AnonCredsRevocationRegistryDefinitionPrivateRecordProps);
    getTags(): {
        revocationRegistryDefinitionId: string;
        credentialDefinitionId: string;
        state: AnonCredsRevocationRegistryState;
    };
}
