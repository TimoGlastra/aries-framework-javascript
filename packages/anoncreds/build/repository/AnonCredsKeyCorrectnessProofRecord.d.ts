import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsKeyCorrectnessProofRecordProps {
    id?: string;
    credentialDefinitionId: string;
    value: Record<string, unknown>;
    createdAt?: Date;
}
export type DefaultAnonCredsKeyCorrectnessProofPrivateTags = {
    credentialDefinitionId: string;
};
export declare class AnonCredsKeyCorrectnessProofRecord extends BaseRecord<DefaultAnonCredsKeyCorrectnessProofPrivateTags, TagsBase> {
    static readonly type = "AnonCredsKeyCorrectnessProofRecord";
    readonly type = "AnonCredsKeyCorrectnessProofRecord";
    readonly credentialDefinitionId: string;
    readonly value: Record<string, unknown>;
    constructor(props: AnonCredsKeyCorrectnessProofRecordProps);
    getTags(): {
        credentialDefinitionId: string;
    };
}
