import type { CheqdNetwork } from '@cheqd/sdk';
import type { ParsedDid } from '@credo-ts/core';
export declare const cheqdSdkAnonCredsRegistryIdentifierRegex: RegExp;
export declare const cheqdDidRegex: RegExp;
export declare const cheqdDidVersionRegex: RegExp;
export declare const cheqdDidVersionsRegex: RegExp;
export declare const cheqdDidMetadataRegex: RegExp;
export declare const cheqdResourceRegex: RegExp;
export declare const cheqdResourceMetadataRegex: RegExp;
export type ParsedCheqdDid = ParsedDid & {
    network: `${CheqdNetwork}`;
};
export declare function parseCheqdDid(didUrl: string): ParsedCheqdDid | null;
