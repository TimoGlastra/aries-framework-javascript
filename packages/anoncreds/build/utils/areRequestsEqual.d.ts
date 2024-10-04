import type { AnonCredsProofRequest } from '../models';
/**
 * Checks whether two proof requests are semantically equal. The `name`, `version` and `nonce`, `ver` fields are ignored.
 * In addition the group names don't have to be the same between the different requests.
 */
export declare function areAnonCredsProofRequestsEqual(requestA: AnonCredsProofRequest, requestB: AnonCredsProofRequest): boolean;
