import type { AnonCredsNonRevokedInterval } from '../models';
interface BestPracticeNonRevokedInterval {
    from?: number;
    to: number;
}
export declare function assertBestPracticeRevocationInterval(revocationInterval: AnonCredsNonRevokedInterval): asserts revocationInterval is BestPracticeNonRevokedInterval;
export {};
