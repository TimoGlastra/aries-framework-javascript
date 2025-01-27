import { KeyBackend as CredoKeyBackend } from '@credo-ts/core';
import { KeyBackend as AskarKeyBackend } from '@hyperledger/aries-askar-shared';
export declare const convertToAskarKeyBackend: (credoKeyBackend: CredoKeyBackend) => AskarKeyBackend;
