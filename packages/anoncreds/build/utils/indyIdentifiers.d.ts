import type { AnonCredsCredentialDefinition, AnonCredsRevocationRegistryDefinition, AnonCredsSchema } from '../models';
export declare const unqualifiedSchemaIdRegex: RegExp;
export declare const didIndySchemaIdRegex: RegExp;
export declare const unqualifiedSchemaVersionRegex: RegExp;
export declare const unqualifiedIndyDidRegex: RegExp;
export declare const unqualifiedCredentialDefinitionIdRegex: RegExp;
export declare const didIndyCredentialDefinitionIdRegex: RegExp;
export declare const unqualifiedRevocationRegistryIdRegex: RegExp;
export declare const didIndyRevocationRegistryIdRegex: RegExp;
export declare const didIndyRegex: RegExp;
export declare function getUnqualifiedSchemaId(unqualifiedDid: string, name: string, version: string): string;
export declare function getUnqualifiedCredentialDefinitionId(unqualifiedDid: string, schemaSeqNo: string | number, tag: string): string;
export declare function getUnqualifiedRevocationRegistryDefinitionId(unqualifiedDid: string, schemaSeqNo: string | number, credentialDefinitionTag: string, revocationRegistryTag: string): string;
export declare function isUnqualifiedIndyDid(did: string): boolean;
export declare function isUnqualifiedCredentialDefinitionId(credentialDefinitionId: string): boolean;
export declare function isUnqualifiedRevocationRegistryId(revocationRegistryId: string): boolean;
export declare function isUnqualifiedSchemaId(schemaId: string): boolean;
export declare function isDidIndySchemaId(schemaId: string): boolean;
export declare function isDidIndyCredentialDefinitionId(credentialDefinitionId: string): boolean;
export declare function isDidIndyRevocationRegistryId(revocationRegistryId: string): boolean;
export declare function parseIndyDid(did: string): {
    namespace: string;
    namespaceIdentifier: string;
};
interface ParsedIndySchemaId {
    did: string;
    namespaceIdentifier: string;
    schemaName: string;
    schemaVersion: string;
    namespace?: string;
}
export declare function parseIndySchemaId(schemaId: string): ParsedIndySchemaId;
interface ParsedIndyCredentialDefinitionId {
    did: string;
    namespaceIdentifier: string;
    schemaSeqNo: string;
    tag: string;
    namespace?: string;
}
export declare function parseIndyCredentialDefinitionId(credentialDefinitionId: string): ParsedIndyCredentialDefinitionId;
interface ParsedIndyRevocationRegistryId {
    did: string;
    namespaceIdentifier: string;
    schemaSeqNo: string;
    credentialDefinitionTag: string;
    revocationRegistryTag: string;
    namespace?: string;
}
export declare function parseIndyRevocationRegistryId(revocationRegistryId: string): ParsedIndyRevocationRegistryId;
export declare function getIndyNamespaceFromIndyDid(identifier: string): string;
export declare function getUnQualifiedDidIndyDid(identifier: string): string;
export declare function isIndyDid(identifier: string): boolean;
export declare function getQualifiedDidIndyDid(identifier: string, namespace: string): string;
export declare function isUnqualifiedDidIndySchema(schema: AnonCredsSchema): boolean;
export declare function getUnqualifiedDidIndySchema(schema: AnonCredsSchema): AnonCredsSchema;
export declare function isQualifiedDidIndySchema(schema: AnonCredsSchema): boolean;
export declare function getQualifiedDidIndySchema(schema: AnonCredsSchema, namespace: string): AnonCredsSchema;
export declare function isUnqualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition: AnonCredsCredentialDefinition): boolean;
export declare function getUnqualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition: AnonCredsCredentialDefinition): AnonCredsCredentialDefinition;
export declare function isQualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition: AnonCredsCredentialDefinition): boolean;
export declare function getQualifiedDidIndyCredentialDefinition(anonCredsCredentialDefinition: AnonCredsCredentialDefinition, namespace: string): AnonCredsCredentialDefinition;
export declare function isUnqualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition): boolean;
export declare function getUnqualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition): AnonCredsRevocationRegistryDefinition;
export declare function isQualifiedRevocationRegistryDefinition(revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition): boolean;
export declare function getQualifiedDidIndyRevocationRegistryDefinition(revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition, namespace: string): AnonCredsRevocationRegistryDefinition;
export {};
