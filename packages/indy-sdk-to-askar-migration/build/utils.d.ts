import type { TagsBase } from '@credo-ts/core';
import { KeyDerivationMethod } from '@credo-ts/core';
import { StoreKeyMethod } from '@hyperledger/aries-askar-shared';
/**
 * Adopted from `AskarStorageService` implementation and should be kept in sync.
 */
export declare const transformFromRecordTagValues: (tags: TagsBase) => {
    [key: string]: string | undefined;
};
export declare const keyDerivationMethodToStoreKeyMethod: (keyDerivationMethod: KeyDerivationMethod) => StoreKeyMethod;
