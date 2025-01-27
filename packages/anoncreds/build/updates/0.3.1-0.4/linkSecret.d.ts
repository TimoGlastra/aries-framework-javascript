import type { BaseAgent } from '@credo-ts/core';
/**
 * Creates an {@link AnonCredsLinkSecretRecord} based on the wallet id. If an {@link AnonCredsLinkSecretRecord}
 * already exists (which is the case when upgraded to Askar), no link secret record will be created.
 */
export declare function migrateLinkSecretToV0_4<Agent extends BaseAgent>(agent: Agent): Promise<void>;
