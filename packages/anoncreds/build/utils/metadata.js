"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.W3cAnonCredsCredentialMetadataKey = exports.AnonCredsCredentialRequestMetadataKey = exports.AnonCredsCredentialMetadataKey = void 0;
// TODO: we may want to already support multiple credentials in the metadata of a credential
// record, as that's what the RFCs support. We already need to write a migration script for modules
/**
 * Metadata key for strong metadata on an AnonCreds credential.
 *
 * MUST be used with {@link AnonCredsCredentialMetadata}
 */
exports.AnonCredsCredentialMetadataKey = '_anoncreds/credential';
/**
 * Metadata key for storing metadata on an AnonCreds credential request.
 *
 * MUST be used with {@link AnonCredsCredentialRequestMetadata}
 */
exports.AnonCredsCredentialRequestMetadataKey = '_anoncreds/credentialRequest';
/**
 * Metadata key for storing the W3C AnonCreds credential metadata.
 *
 * MUST be used with {@link W3cAnonCredsCredentialMetadata}
 */
exports.W3cAnonCredsCredentialMetadataKey = '_w3c/anonCredsMetadata';
//# sourceMappingURL=metadata.js.map