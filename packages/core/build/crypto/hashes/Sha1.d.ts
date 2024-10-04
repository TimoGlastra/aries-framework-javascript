import type { IHash } from './IHash';
export declare class Sha1 implements IHash {
    hash(data: Uint8Array | string): Uint8Array;
}
