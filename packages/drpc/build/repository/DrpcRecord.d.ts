import type { DrpcRequest, DrpcResponse } from '../messages';
import type { DrpcRole, DrpcState } from '../models';
import type { RecordTags, TagsBase } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export type CustomDrpcMessageTags = TagsBase;
export type DefaultDrpcMessageTags = {
    connectionId: string;
    threadId: string;
};
export type DrpcMessageTags = RecordTags<DrpcRecord>;
export interface DrpcStorageProps {
    id?: string;
    connectionId: string;
    role: DrpcRole;
    tags?: CustomDrpcMessageTags;
    request?: DrpcRequest;
    response?: DrpcResponse;
    state: DrpcState;
    threadId: string;
}
export declare class DrpcRecord extends BaseRecord<DefaultDrpcMessageTags, CustomDrpcMessageTags> {
    request?: DrpcRequest;
    response?: DrpcResponse;
    connectionId: string;
    role: DrpcRole;
    state: DrpcState;
    threadId: string;
    static readonly type = "DrpcRecord";
    readonly type = "DrpcRecord";
    constructor(props: DrpcStorageProps);
    getTags(): {
        connectionId: string;
        threadId: string;
    };
    assertRole(expectedRole: DrpcRole): void;
    assertState(expectedStates: DrpcState | DrpcState[]): void;
}
