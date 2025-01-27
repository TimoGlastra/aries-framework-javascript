export declare const indyVdrAnonCredsRegistryIdentifierRegex: RegExp;
export declare function getDidIndySchemaId(namespace: string, unqualifiedDid: string, name: string, version: string): string;
export declare function getDidIndyCredentialDefinitionId(namespace: string, unqualifiedDid: string, schemaSeqNo: string | number, tag: string): string;
export declare function getDidIndyRevocationRegistryDefinitionId(namespace: string, unqualifiedDid: string, schemaSeqNo: string | number, credentialDefinitionTag: string, revocationRegistryTag: string): string;
export declare function getDidIndyRevocationRegistryEntryId(namespace: string, unqualifiedDid: string, schemaSeqNo: string | number, credentialDefinitionTag: string, revocationRegistryTag: string): string;
