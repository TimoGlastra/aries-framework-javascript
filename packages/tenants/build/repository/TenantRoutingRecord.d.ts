import type { RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type TenantRoutingRecordTags = RecordTags<TenantRoutingRecord>;
type DefaultTenantRoutingRecordTags = {
    tenantId: string;
    recipientKeyFingerprint: string;
};
export interface TenantRoutingRecordProps {
    id?: string;
    createdAt?: Date;
    tags?: TagsBase;
    tenantId: string;
    recipientKeyFingerprint: string;
}
export declare class TenantRoutingRecord extends BaseRecord<DefaultTenantRoutingRecordTags> {
    static readonly type = "TenantRoutingRecord";
    readonly type = "TenantRoutingRecord";
    tenantId: string;
    recipientKeyFingerprint: string;
    constructor(props: TenantRoutingRecordProps);
    getTags(): {
        tenantId: string;
        recipientKeyFingerprint: string;
    };
}
export {};
