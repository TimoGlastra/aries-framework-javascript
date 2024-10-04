import type { EncryptedMessage } from '@credo-ts/core';
import { Key as AskarKey } from '@hyperledger/aries-askar-shared';
export declare function didcommV1Pack(payload: Record<string, unknown>, recipientKeys: string[], senderKey?: AskarKey): EncryptedMessage;
export declare function didcommV1Unpack(messagePackage: EncryptedMessage, recipientKey: AskarKey): {
    plaintextMessage: any;
    senderKey: string | undefined;
    recipientKey: string;
};
