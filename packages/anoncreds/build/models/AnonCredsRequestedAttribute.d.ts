import type { AnonCredsRestrictionOptions } from './AnonCredsRestriction';
import { AnonCredsRestriction } from './AnonCredsRestriction';
import { AnonCredsRevocationInterval } from './AnonCredsRevocationInterval';
export interface AnonCredsRequestedAttributeOptions {
    name?: string;
    names?: string[];
    nonRevoked?: AnonCredsRevocationInterval;
    restrictions?: AnonCredsRestrictionOptions[];
}
export declare class AnonCredsRequestedAttribute {
    constructor(options: AnonCredsRequestedAttributeOptions);
    name?: string;
    names?: string[];
    nonRevoked?: AnonCredsRevocationInterval;
    restrictions?: AnonCredsRestriction[];
}
