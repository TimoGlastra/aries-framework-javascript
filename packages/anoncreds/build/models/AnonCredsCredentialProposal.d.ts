export interface AnonCredsCredentialProposalOptions {
    /**
     * @deprecated Use `schemaIssuerId` instead. Only valid for legacy indy identifiers.
     */
    schemaIssuerDid?: string;
    schemaIssuerId?: string;
    schemaId?: string;
    schemaName?: string;
    schemaVersion?: string;
    credentialDefinitionId?: string;
    /**
     * @deprecated Use `issuerId` instead. Only valid for legacy indy identifiers.
     */
    issuerDid?: string;
    issuerId?: string;
}
/**
 * Class representing an AnonCreds credential proposal as defined in Aries RFC 0592 (and soon the new AnonCreds RFC)
 */
export declare class AnonCredsCredentialProposal {
    constructor(options: AnonCredsCredentialProposalOptions);
    /**
     * Filter to request credential based on a particular Schema issuer DID.
     *
     * May only be used with legacy indy identifiers
     *
     * @deprecated Use schemaIssuerId instead
     */
    schemaIssuerDid?: string;
    /**
     * Filter to request credential based on a particular Schema issuer DID.
     */
    schemaIssuerId?: string;
    /**
     * Filter to request credential based on a particular Schema.
     */
    schemaId?: string;
    /**
     * Filter to request credential based on a schema name.
     */
    schemaName?: string;
    /**
     * Filter  to request credential based on a schema version.
     */
    schemaVersion?: string;
    /**
     * Filter to request credential based on a particular Credential Definition.
     */
    credentialDefinitionId?: string;
    /**
     * Filter to request a credential issued by the owner of a particular DID.
     *
     * May only be used with legacy indy identifiers
     *
     * @deprecated Use issuerId instead
     */
    issuerDid?: string;
    /**
     * Filter to request a credential issued by the owner of a particular DID.
     */
    issuerId?: string;
}
