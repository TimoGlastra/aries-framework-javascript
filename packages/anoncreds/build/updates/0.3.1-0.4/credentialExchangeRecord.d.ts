import type { BaseAgent, CredentialExchangeRecord } from '@credo-ts/core';
/**
 * Migrates the {@link CredentialExchangeRecord} to 0.4 compatible format. It fetches all credential exchange records from
 *  storage and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - {@link migrateIndyCredentialMetadataToAnonCredsMetadata}
 *  - {@link migrateIndyCredentialTypeToAnonCredsCredential}
 */
export declare function migrateCredentialExchangeRecordToV0_4<Agent extends BaseAgent>(agent: Agent): Promise<void>;
/**
 * Migrates the indy credential record binding to anoncreds credential record binding.
 *
 * The following 0.3.1 credential record structure (unrelated keys omitted):
 *
 * ```json
 * {
 *   "credentials": [
 *     {
 *       "credentialRecordId": "credential-id",
 *       "credentialRecordType": "indy"
 *     },
 *     {
 *       "credentialRecordId": "credential-id2",
 *       "credentialRecordType": "jsonld"
 *     }
 *   ]
 * }
 * ```
 *
 * Wil be tranformed into the following 0.4 credential record structure (unrelated keys omitted):
 * ```json
 * {
 *   "credentials": [
 *     {
 *       "credentialRecordId": "credential-id",
 *       "credentialRecordType": "anoncreds"
 *     },
 *     {
 *       "credentialRecordId": "credential-id2",
 *       "credentialRecordType": "jsonld"
 *     }
 *   ]
 * }
 * ```
 */
export declare function migrateIndyCredentialTypeToAnonCredsCredential<Agent extends BaseAgent>(agent: Agent, credentialRecord: CredentialExchangeRecord): void;
/**
 * Migrates the indy credential metadata type to anoncreds credential metadata type.
 *
 * The following 0.3.1 credential metadata structure (unrelated keys omitted):
 *
 * ```json
 * {
 *   "_internal/indyRequest": {}
 *   "_internal/indyCredential": {}
 * }
 * ```
 *
 * Wil be tranformed into the following 0.4 credential metadata structure (unrelated keys omitted):
 * ```json
 * {
 *   "_anoncreds/credentialRequest": {}
 *   "_anoncreds/credential": {}
 * }
 * ```
 */
export declare function migrateIndyCredentialMetadataToAnonCredsMetadata<Agent extends BaseAgent>(agent: Agent, credentialRecord: CredentialExchangeRecord): void;
