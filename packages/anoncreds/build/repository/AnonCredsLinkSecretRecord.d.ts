import type { TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsLinkSecretRecordProps {
    id?: string;
    linkSecretId: string;
    value?: string;
}
export type DefaultAnonCredsLinkSecretTags = {
    linkSecretId: string;
};
export type CustomAnonCredsLinkSecretTags = TagsBase & {
    isDefault?: boolean;
};
export declare class AnonCredsLinkSecretRecord extends BaseRecord<DefaultAnonCredsLinkSecretTags, TagsBase> {
    static readonly type = "AnonCredsLinkSecretRecord";
    readonly type = "AnonCredsLinkSecretRecord";
    readonly linkSecretId: string;
    readonly value?: string;
    constructor(props: AnonCredsLinkSecretRecordProps);
    getTags(): {
        linkSecretId: string;
    };
}
