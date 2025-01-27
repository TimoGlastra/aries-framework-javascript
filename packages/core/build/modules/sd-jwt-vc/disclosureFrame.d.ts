import type { JsonObject } from '../../types';
type DisclosureFrame = {
    [key: string]: boolean | DisclosureFrame;
};
export declare function buildDisclosureFrameForPayload(input: JsonObject): DisclosureFrame;
export {};
