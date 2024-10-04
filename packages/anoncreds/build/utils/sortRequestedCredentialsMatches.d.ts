import type { AnonCredsRequestedAttributeMatch, AnonCredsRequestedPredicateMatch } from '../models';
/**
 * Sort requested attributes and predicates by `revoked` status. The order is:
 *  - first credentials with `revoked` set to undefined, this means no revocation status is needed for the credentials
 *  - then credentials with `revoked` set to false, this means the credentials are not revoked
 *  - then credentials with `revoked` set to true, this means the credentials are revoked
 */
export declare function sortRequestedCredentialsMatches<Requested extends Array<AnonCredsRequestedAttributeMatch> | Array<AnonCredsRequestedPredicateMatch>>(credentials: Requested): Requested[number][];
