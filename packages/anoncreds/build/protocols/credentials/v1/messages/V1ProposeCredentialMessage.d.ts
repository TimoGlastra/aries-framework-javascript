import type { Attachment } from '@credo-ts/core';
import { AgentMessage } from '@credo-ts/core';
import { V1CredentialPreview } from './V1CredentialPreview';
export interface V1ProposeCredentialMessageOptions {
    id?: string;
    comment?: string;
    credentialPreview?: V1CredentialPreview;
    schemaIssuerDid?: string;
    schemaId?: string;
    schemaName?: string;
    schemaVersion?: string;
    credentialDefinitionId?: string;
    issuerDid?: string;
    attachments?: Attachment[];
}
/**
 * Message part of Issue Credential Protocol used to initiate credential exchange by prover.
 *
 * @see https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md#propose-credential
 */
export declare class V1ProposeCredentialMessage extends AgentMessage {
    readonly allowDidSovPrefix = true;
    constructor(options: V1ProposeCredentialMessageOptions);
    readonly type: string;
    static readonly type: import("@credo-ts/core").ParsedMessageType;
    /**
     * Human readable information about this Credential Proposal,
     * so the proposal can be evaluated by human judgment.
     */
    comment?: string;
    /**
     * Represents the credential data that Prover wants to receive.
     */
    credentialPreview?: V1CredentialPreview;
    /**
     * Filter to request credential based on a particular Schema issuer DID.
     */
    schemaIssuerDid?: string;
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
     */
    issuerDid?: string;
}
