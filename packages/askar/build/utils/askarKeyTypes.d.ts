import { KeyType } from '@credo-ts/core';
export declare enum AskarKeyTypePurpose {
    KeyManagement = "KeyManagement",
    Signing = "Signing",
    Encryption = "Encryption"
}
export declare const isKeyTypeSupportedByAskarForPurpose: (keyType: KeyType, purpose: AskarKeyTypePurpose) => boolean;
export declare const keyTypesSupportedByAskar: KeyType[];
