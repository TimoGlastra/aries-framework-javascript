import type { AnonCredsRestrictionOptions } from './AnonCredsRestriction';
import { AnonCredsPredicateType } from '../models';
import { AnonCredsRestriction } from './AnonCredsRestriction';
import { AnonCredsRevocationInterval } from './AnonCredsRevocationInterval';
export interface AnonCredsRequestedPredicateOptions {
    name: string;
    predicateType: AnonCredsPredicateType;
    predicateValue: number;
    nonRevoked?: AnonCredsRevocationInterval;
    restrictions?: AnonCredsRestrictionOptions[];
}
export declare class AnonCredsRequestedPredicate {
    constructor(options: AnonCredsRequestedPredicateOptions);
    name: string;
    predicateType: AnonCredsPredicateType;
    predicateValue: number;
    nonRevoked?: AnonCredsRevocationInterval;
    restrictions?: AnonCredsRestriction[];
}
