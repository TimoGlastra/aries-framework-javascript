import type { AnonCredsCredentialDefinition, AnonCredsRevocationRegistryDefinition, AnonCredsRevocationStatusList, AnonCredsSchema } from '@credo-ts/anoncreds';
export declare class CheqdSchema {
    constructor(options: Omit<AnonCredsSchema, 'issuerId'>);
    name: string;
    attrNames: string[];
    version: string;
}
export declare class CheqdCredentialDefinitionValue {
    primary: Record<string, unknown>;
    revocation?: unknown;
}
export declare class CheqdCredentialDefinition {
    constructor(options: Omit<AnonCredsCredentialDefinition, 'issuerId'>);
    schemaId: string;
    type: 'CL';
    tag: string;
    value: CheqdCredentialDefinitionValue;
}
export declare class AccumKey {
    z: string;
}
export declare class PublicKeys {
    accumKey: AccumKey;
}
export declare class CheqdRevocationRegistryDefinitionValue {
    publicKeys: PublicKeys;
    maxCredNum: number;
    tailsLocation: string;
    tailsHash: string;
}
export declare class CheqdRevocationRegistryDefinition {
    constructor(options: Omit<AnonCredsRevocationRegistryDefinition, 'issuerId'>);
    revocDefType: 'CL_ACCUM';
    credDefId: string;
    tag: string;
    value: CheqdRevocationRegistryDefinitionValue;
}
export declare class CheqdRevocationStatusList {
    constructor(options: Omit<AnonCredsRevocationStatusList, 'issuerId'>);
    revRegDefId: string;
    revocationList: number[];
    currentAccumulator: string;
}
