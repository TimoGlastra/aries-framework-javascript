import type { AnonCredsRevocationStatusList, AnonCredsRevocationRegistryDefinition } from '@credo-ts/anoncreds';
export type RevocationRegistryDelta = {
    accum: string;
    issued: number[];
    revoked: number[];
    txnTime: number;
};
export declare function anonCredsRevocationStatusListFromIndyVdr(revocationRegistryDefinitionId: string, revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition, delta: RevocationRegistryDelta, isIssuanceByDefault: boolean): AnonCredsRevocationStatusList;
/**
 *
 * Transforms the previous deltas and the full revocation status list into the latest delta
 *
 * ## Example
 *
 * input:
 *
 * revocationStatusList: [0, 1, 1, 1, 0, 0, 0, 1, 1, 0]
 * previousDelta:
 *   - issued: [1, 2, 5, 8, 9]
 *   - revoked: [0, 3, 4, 6, 7]
 *
 * output:
 *   - issued: [5, 9]
 *   - revoked: [3, 7]
 *
 */
export declare function indyVdrCreateLatestRevocationDelta(currentAccumulator: string, revocationStatusList: Array<number>, previousDelta?: RevocationRegistryDelta): {
    issued: number[];
    revoked: number[];
    accum: string;
    prevAccum: string | undefined;
};
