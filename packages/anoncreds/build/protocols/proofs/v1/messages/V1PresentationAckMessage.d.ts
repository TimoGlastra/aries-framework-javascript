import type { AckMessageOptions } from '@credo-ts/core';
import { AckMessage } from '@credo-ts/core';
export declare class V1PresentationAckMessage extends AckMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: AckMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
