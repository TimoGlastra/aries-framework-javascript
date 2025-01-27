import type { TenantConfig } from '../models/TenantConfig';
import type { RecordTags, TagsBase, VersionString } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type TenantRecordTags = RecordTags<TenantRecord>;
export interface TenantRecordProps {
    id?: string;
    createdAt?: Date;
    config: TenantConfig;
    tags?: TagsBase;
    storageVersion: VersionString;
}
export type DefaultTenantRecordTags = {
    label: string;
    storageVersion: VersionString;
};
export declare class TenantRecord extends BaseRecord<DefaultTenantRecordTags> {
    static readonly type = "TenantRecord";
    readonly type = "TenantRecord";
    config: TenantConfig;
    /**
     * The storage version that is used by this tenant. Can be used to know if the tenant is ready to be used
     * with the current version of the application.
     *
     * @default 0.4 from 0.5 onwards we set the storage version on creation, so if no value
     * is stored, it means the storage version is 0.4 (when multi-tenancy was introduced)
     */
    storageVersion: VersionString;
    constructor(props: TenantRecordProps);
    getTags(): {
        label: string;
        storageVersion: VersionString;
    };
}
