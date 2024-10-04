import type { AckMessageOptions } from '@credo-ts/core';
import { AckMessage } from '@credo-ts/core';
export type V1CredentialAckMessageOptions = AckMessageOptions;
/**
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0015-acks/README.md#explicit-acks
 */
export declare class V1CredentialAckMessage extends AckMessage {
    readonly allowDidSovPrefix = true;
    /**
     * Create new CredentialAckMessage instance.
     * @param options
     */
    constructor(options: V1CredentialAckMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
}
