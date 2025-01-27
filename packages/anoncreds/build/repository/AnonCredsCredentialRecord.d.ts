import type { AnonCredsCredential } from '../models';
import type { Tags } from '@credo-ts/core';
import { BaseRecord } from '@credo-ts/core';
export interface AnonCredsCredentialRecordProps {
    id?: string;
    createdAt?: Date;
    credential: AnonCredsCredential;
    credentialId: string;
    credentialRevocationId?: string;
    linkSecretId: string;
    schemaName: string;
    schemaVersion: string;
    schemaIssuerId: string;
    issuerId: string;
    methodName: string;
}
export type DefaultAnonCredsCredentialTags = {
    credentialId: string;
    linkSecretId: string;
    credentialDefinitionId: string;
    credentialRevocationId?: string;
    revocationRegistryId?: string;
    schemaId: string;
    methodName: string;
    [key: `attr::${string}::marker`]: true | undefined;
    [key: `attr::${string}::value`]: string | undefined;
};
export type CustomAnonCredsCredentialTags = {
    schemaName: string;
    schemaVersion: string;
    schemaIssuerId: string;
    issuerId: string;
};
export declare class AnonCredsCredentialRecord extends BaseRecord<DefaultAnonCredsCredentialTags, CustomAnonCredsCredentialTags> {
    static readonly type = "AnonCredsCredentialRecord";
    readonly type = "AnonCredsCredentialRecord";
    readonly credentialId: string;
    readonly credentialRevocationId?: string;
    readonly linkSecretId: string;
    readonly credential: AnonCredsCredential;
    /**
     * AnonCreds method name. We don't use names explicitly from the registry (there's no identifier for a registry)
     * @see https://hyperledger.github.io/anoncreds-methods-registry/
     */
    readonly methodName: string;
    constructor(props: AnonCredsCredentialRecordProps);
    getTags(): Tags<DefaultAnonCredsCredentialTags, CustomAnonCredsCredentialTags>;
}
